import pytest
from django.conf import settings
from django.db import connection


@pytest.mark.django_db
def test_django_uses_postgresql_test_database():
    assert settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql'
    assert connection.vendor == 'postgresql'

    with connection.cursor() as cursor:
        cursor.execute('SELECT current_database(), 1')
        database_name, query_result = cursor.fetchone()

    assert database_name == connection.settings_dict['NAME']
    assert database_name.startswith('test_')
    assert query_result == 1
