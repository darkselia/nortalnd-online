from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

from .models import Account, normalize_email, normalize_phone


class AccountPasswordBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        identifier = username or kwargs.get(Account.USERNAME_FIELD)
        if not identifier or password is None:
            return None

        if '@' in identifier:
            query = Q(email__iexact=normalize_email(identifier))
        else:
            try:
                query = Q(phone=normalize_phone(identifier))
            except ValueError:
                return None

        try:
            user = Account.objects.get(query)
        except Account.DoesNotExist:
            Account().set_password(password)
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
