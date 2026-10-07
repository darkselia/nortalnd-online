"""Normalize errors raised inside DRF application views."""

from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler


def _field_errors(details):
    fields = {}

    def collect(value, path):
        if isinstance(value, dict) and set(value) == {'message', 'code'}:
            fields.setdefault(path or 'non_field_errors', []).append(
                {'code': str(value['code']), 'message': str(value['message'])}
            )
        elif isinstance(value, dict):
            for key, child in value.items():
                collect(child, f'{path}.{key}' if path else str(key))
        elif isinstance(value, list):
            for index, child in enumerate(value):
                if isinstance(child, dict) and set(child) == {'message', 'code'}:
                    child_path = path
                else:
                    child_path = f'{path}.{index}' if path else str(index)
                collect(child, child_path)

    collect(details, '')
    return fields


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, ValidationError):
        code = 'validation_error'
        message = 'Некорректные данные.'
        fields = _field_errors(exc.get_full_details())
    else:
        detail = (
            response.data.get('detail') if isinstance(response.data, dict) else None
        )
        code = str(getattr(detail, 'code', 'error'))
        message = str(detail) if detail is not None else 'Ошибка запроса.'
        fields = {}

    response.data = {'error': {'code': code, 'message': message, 'fields': fields}}
    return response
