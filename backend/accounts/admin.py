from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import AccountChangeForm, AccountCreationForm
from .models import Account


@admin.register(Account)
class AccountAdmin(UserAdmin):
    form = AccountChangeForm
    add_form = AccountCreationForm
    list_display = ('phone', 'full_name', 'email', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    search_fields = ('phone', 'email', 'full_name')
    ordering = ('phone',)
    readonly_fields = (
        'created_by_staff_account',
        'created_at',
        'updated_at',
        'last_login',
    )
    filter_horizontal = ('groups', 'user_permissions')
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Личные данные', {'fields': ('full_name', 'email')}),
        (
            'Доступ',
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'groups',
                    'user_permissions',
                )
            },
        ),
        (
            'История',
            {
                'fields': (
                    'created_by_staff_account',
                    'last_login',
                    'created_at',
                    'updated_at',
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('phone', 'full_name', 'email', 'password1', 'password2'),
            },
        ),
    )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by_staff_account = request.user
        super().save_model(request, obj, form, change)
