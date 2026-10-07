import pytest
from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.db import IntegrityError, transaction
from django.urls import reverse
from django.utils import timezone

pytestmark = pytest.mark.django_db


def test_password_login_uses_phone_or_optional_email():
    account_model = get_user_model()
    account = account_model.objects.create_user(
        phone=' +79991234567 ',
        full_name='Мария Северная',
        email='  Parent@Example.COM ',
        password='safe-test-password-731',
    )

    assert account.phone == '+79991234567'
    assert account.email == 'parent@example.com'
    assert account.password != 'safe-test-password-731'
    assert (
        authenticate(username=account.phone, password='safe-test-password-731')
        == account
    )
    assert (
        authenticate(username='PARENT@example.com', password='safe-test-password-731')
        == account
    )
    assert authenticate(username=account.phone, password='wrong-password') is None

    account.is_active = False
    account.save()
    assert (
        authenticate(username=account.phone, password='safe-test-password-731') is None
    )


def test_contacts_are_unique_and_phone_is_required():
    account_model = get_user_model()
    account_model.objects.create_user(
        phone='+79991234567',
        full_name='Первый взрослый',
        email='first@example.com',
        password='safe-test-password-731',
    )

    with pytest.raises(ValidationError):
        account_model.objects.create_user(
            phone='+79991234567',
            full_name='Повтор телефона',
            password='safe-test-password-731',
        )
    for phone in ('79991234567', '89991234567'):
        with pytest.raises(ValidationError):
            account_model.objects.create_user(
                phone=phone,
                full_name='Повтор телефона',
                password='safe-test-password-731',
            )
    with pytest.raises(ValidationError):
        account_model.objects.create_user(
            phone='+79997654321',
            full_name='Повтор почты',
            email='FIRST@EXAMPLE.COM',
            password='safe-test-password-731',
        )
    with pytest.raises(ValueError):
        account_model.objects.create_user(
            phone='9991234567',
            full_name='Неполный номер',
            password='safe-test-password-731',
        )

    second = account_model.objects.create(
        phone='+79997654321',
        full_name='Проверка БД',
        email='second@example.com',
        password='unusable',
    )
    with pytest.raises(IntegrityError), transaction.atomic():
        account_model.objects.filter(pk=second.pk).update(email='FIRST@EXAMPLE.COM')


def test_russian_phone_variants_work_for_creation_login_and_admin(client):
    account_model = get_user_model()
    admin = account_model.objects.create_superuser(
        phone='89991234567',
        full_name='Администратор',
        password='safe-test-password-731',
    )
    assert admin.phone == '+79991234567'
    for phone in ('+79991234567', '79991234567', '89991234567'):
        assert authenticate(username=phone, password='safe-test-password-731') == admin

    assert client.login(username='79991234567', password='safe-test-password-731')
    response = client.post(
        reverse('admin:accounts_account_add'),
        {
            'phone': '89997654321',
            'full_name': 'Новый сотрудник',
            'email': ' STAFF@EXAMPLE.COM ',
            'password1': 'another-safe-test-password-731',
            'password2': 'another-safe-test-password-731',
            '_save': 'Save',
        },
    )
    assert response.status_code == 302
    created = account_model.objects.get(phone='+79997654321')
    assert created.email == 'staff@example.com'

    invalid_response = client.post(
        reverse('admin:accounts_account_add'),
        {
            'phone': '79995554433',
            'full_name': 'Неверная почта',
            'email': 'invalid-email',
            'password1': 'another-safe-test-password-731',
            'password2': 'another-safe-test-password-731',
            '_save': 'Save',
        },
    )
    assert invalid_response.status_code == 200
    assert not account_model.objects.filter(phone='+79995554433').exists()


def test_email_validation_on_manager_and_direct_saves():
    account_model = get_user_model()
    with pytest.raises(ValidationError):
        account_model.objects.create_user(
            phone='89991234567',
            full_name='Некорректная почта',
            email='invalid-email',
            password='safe-test-password-731',
        )

    account = account_model(
        phone='89991234567',
        full_name='Взрослый',
        email='invalid-email',
    )
    account.set_password('safe-test-password-731')
    with pytest.raises(ValidationError):
        account.save()

    account.email = 123
    with pytest.raises(ValidationError):
        account.save()

    account.email = ' Parent@Example.COM '
    account.save()
    assert account.phone == '+79991234567'
    assert account.email == 'parent@example.com'
    assert account.phone_verified_at is None
    assert account.email_verified_at is None
    assert account.external_brand_id is None

    account.email = 'invalid-email'
    with pytest.raises(ValidationError):
        account.save(update_fields={'email'})
    account.email = 'different@example.com'
    account.phone = '89991234567'
    account.save(update_fields={'email'})
    account.refresh_from_db()
    assert account.phone == '+79991234567'
    assert account.email == 'different@example.com'

    account.email = 'invalid-email'
    account.last_login = None
    account.save(update_fields={'last_login'})
    account.refresh_from_db()
    assert account.email == 'different@example.com'

    verified_at = timezone.now()
    account.phone_verified_at = verified_at
    account.email_verified_at = verified_at
    account.external_brand_id = 'brand-123'
    account.save(
        update_fields={'phone_verified_at', 'email_verified_at', 'external_brand_id'}
    )
    account.refresh_from_db()
    assert account.phone_verified_at == verified_at
    assert account.email_verified_at == verified_at
    assert account.external_brand_id == 'brand-123'


def test_manager_supports_unusable_password_and_superuser():
    account_model = get_user_model()
    passwordless = account_model.objects.create_user(
        phone='+79991234567', full_name='Будущий способ входа'
    )
    assert not passwordless.has_usable_password()
    assert authenticate(username=passwordless.phone, password='anything') is None

    with pytest.raises(ValueError):
        account_model.objects.create_superuser(
            phone='+79997654321', full_name='Администратор', password=''
        )
    with pytest.raises(ValueError):
        account_model.objects.create_superuser(
            phone='+79997654321',
            full_name='Администратор',
            password='safe-test-password-731',
            is_staff=False,
        )

    admin = account_model.objects.create_superuser(
        phone='+79997654321',
        full_name='Администратор',
        password='safe-test-password-731',
    )
    assert admin.is_staff and admin.is_superuser


def test_createsuperuser_command_and_admin_account_creation(client, monkeypatch):
    monkeypatch.setenv('DJANGO_SUPERUSER_PASSWORD', 'safe-test-password-731')
    call_command(
        'createsuperuser',
        interactive=False,
        phone='+79991234567',
        full_name='Первый администратор',
    )

    admin = get_user_model().objects.get(phone='+79991234567')
    assert admin.check_password('safe-test-password-731')
    assert client.login(username=admin.phone, password='safe-test-password-731')
    assert client.get(reverse('admin:accounts_account_changelist')).status_code == 200

    response = client.post(
        reverse('admin:accounts_account_add'),
        {
            'phone': '+79997654321',
            'full_name': 'Новый сотрудник',
            'email': 'staff@example.com',
            'password1': 'another-safe-test-password-731',
            'password2': 'another-safe-test-password-731',
            '_save': 'Save',
        },
    )
    assert response.status_code == 302
    created = get_user_model().objects.get(phone='+79997654321')
    assert created.check_password('another-safe-test-password-731')
    assert created.created_by_staff_account == admin
    assert not created.is_staff
