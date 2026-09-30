"""Shared response behavior for versioned application API views."""

from rest_framework.response import Response


class ApiResponseMixin:
    """Wrap successful DRF responses while preserving their HTTP status."""

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if (
            isinstance(response, Response)
            and 200 <= response.status_code < 300
            and response.status_code != 204
            and not getattr(response, 'exception', False)
            and not getattr(response, 'api_enveloped', False)
        ):
            response.data = {'data': response.data}
        return response
