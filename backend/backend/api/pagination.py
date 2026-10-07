"""Bounded, consistently shaped page-number pagination."""

from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class ApiPageNumberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_page_size(self, request):
        raw_size = request.query_params.get(self.page_size_query_param)
        if raw_size is None:
            return self.page_size

        try:
            size = int(raw_size)
        except (TypeError, ValueError):
            size = 0
        if size < 1:
            raise ValidationError({'page_size': ['Enter a positive integer.']})
        return min(size, self.max_page_size)

    def get_paginated_response(self, data):
        response = Response(
            {
                'data': data,
                'pagination': {
                    'page': self.page.number,
                    'page_size': self.page.paginator.per_page,
                    'count': self.page.paginator.count,
                    'next': self.get_next_link(),
                    'previous': self.get_previous_link(),
                },
            }
        )
        response.api_enveloped = True
        return response

    def get_paginated_response_schema(self, schema):
        return {
            'type': 'object',
            'required': ['data', 'pagination'],
            'properties': {
                'data': schema,
                'pagination': {
                    'type': 'object',
                    'required': ['page', 'page_size', 'count', 'next', 'previous'],
                    'properties': {
                        'page': {'type': 'integer', 'minimum': 1},
                        'page_size': {'type': 'integer', 'minimum': 1, 'maximum': 100},
                        'count': {'type': 'integer', 'minimum': 0},
                        'next': {'type': 'string', 'format': 'uri', 'nullable': True},
                        'previous': {
                            'type': 'string',
                            'format': 'uri',
                            'nullable': True,
                        },
                    },
                },
            },
        }
