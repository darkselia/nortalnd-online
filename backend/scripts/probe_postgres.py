"""Return 3 only when the configured PostgreSQL port is unreachable."""

import os
import socket
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

from django.conf import settings  # noqa: E402


def main():
    database = settings.DATABASES['default']
    if database['ENGINE'] != 'django.db.backends.postgresql':
        print('Backend не настроен на PostgreSQL.', file=sys.stderr)
        return 1

    host = database['HOST'] or '127.0.0.1'
    port = int(database['PORT'] or 5432)
    try:
        with socket.create_connection((host, port), timeout=2):
            pass
    except OSError:
        print(
            f'PostgreSQL недоступен по адресу {host}:{port}. '
            'Запуск из корня: docker compose --env-file backend/.env up -d --wait postgres',
            file=sys.stderr,
        )
        return 3
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
