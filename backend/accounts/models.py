import re
import uuid

from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.db.models.functions import Lower

PHONE_PATTERN = re.compile(r'^\+[1-9]\d{1,14}$')
RUSSIAN_PHONE_PATTERN = re.compile(r'^[78]\d{10}$')
phone_validator = RegexValidator(
    regex=re.compile(r'^(?:\+[1-9]\d{1,14}|[78]\d{10})$'),
    message='Укажите номер в международном формате или 11 цифр с началом 7/8.',
)


def normalize_phone(phone):
    if not isinstance(phone, str):
        raise ValueError('Номер телефона обязателен.')
    phone = phone.strip()
    if RUSSIAN_PHONE_PATTERN.fullmatch(phone):
        return '+7' + phone[1:]
    if not PHONE_PATTERN.fullmatch(phone):
        raise ValueError(
            'Укажите номер в международном формате или 11 цифр с началом 7/8.'
        )
    return phone


def normalize_email(email):
    if email is None:
        return None
    if not isinstance(email, str):
        raise ValueError('Укажите корректный email.')
    email = email.strip().lower()
    return email or None


class AccountManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, phone, full_name, password=None, **extra_fields):
        if not full_name or not full_name.strip():
            raise ValueError('ФИО обязательно.')
        user = self.model(
            phone=normalize_phone(phone),
            full_name=full_name.strip(),
            **extra_fields,
        )
        if password is None:
            user.set_unusable_password()
        else:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, full_name, password, **extra_fields):
        if not password:
            raise ValueError('Суперпользователю нужен пароль.')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if (
            extra_fields['is_staff'] is not True
            or extra_fields['is_superuser'] is not True
        ):
            raise ValueError('Суперпользователю нужны is_staff и is_superuser.')
        return self.create_user(phone, full_name, password, **extra_fields)


class Account(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=32, unique=True, validators=[phone_validator])
    email = models.EmailField(null=True, blank=True)
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    external_brand_id = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_by_staff_account = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='created_accounts',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AccountManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']
    EMAIL_FIELD = 'email'

    class Meta:
        db_table = 'accounts'
        constraints = [
            models.UniqueConstraint(Lower('email'), name='accounts_email_ci_unique'),
        ]

    def clean(self):
        super().clean()
        self._normalize_contacts()

    def _normalize_contacts(self):
        try:
            self.phone = normalize_phone(self.phone)
        except ValueError as error:
            raise ValidationError({'phone': str(error)}) from error
        try:
            self.email = normalize_email(self.email)
        except ValueError as error:
            raise ValidationError({'email': str(error)}) from error

    def save(self, *args, **kwargs):
        update_fields = kwargs.get('update_fields')
        if update_fields is not None:
            update_fields = frozenset(update_fields)
            kwargs['update_fields'] = update_fields
        if update_fields is None or {'phone', 'email'} & update_fields:
            self._normalize_contacts()
            self.full_clean()
        super().save(*args, **kwargs)

    def get_full_name(self):
        return self.full_name

    def __str__(self):
        return self.phone
