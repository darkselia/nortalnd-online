"""Reusable OpenAPI serializers for the shared response contract."""

from drf_spectacular.utils import inline_serializer
from rest_framework import serializers


class FieldErrorSerializer(serializers.Serializer):
    code = serializers.CharField()
    message = serializers.CharField()


class ErrorDetailsSerializer(serializers.Serializer):
    code = serializers.CharField()
    message = serializers.CharField()
    fields = serializers.DictField(
        child=serializers.ListField(child=FieldErrorSerializer())
    )


class ErrorResponseSerializer(serializers.Serializer):
    error = ErrorDetailsSerializer()


def success_response_serializer(name, data_serializer):
    """Declare the actual response body of an unpaginated API operation."""
    return inline_serializer(name=name, fields={'data': data_serializer})
