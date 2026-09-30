import pytest
from django.urls import path
from drf_spectacular.utils import extend_schema
from rest_framework import generics, serializers
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Account
from backend.api.responses import ApiResponseMixin
from backend.api.schema import ErrorResponseSerializer, success_response_serializer
from backend.urls import urlpatterns as project_urlpatterns

pytestmark = pytest.mark.django_db


class ExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('id', 'full_name')


class ExampleListView(ApiResponseMixin, generics.ListAPIView):
    serializer_class = ExampleSerializer
    filterset_fields = ('id', 'full_name')
    ordering_fields = ('full_name',)
    search_fields = ('full_name',)

    def get_queryset(self):
        return Account.objects.order_by('full_name', 'id')


class ExampleDetailView(ApiResponseMixin, APIView):
    @extend_schema(
        responses=success_response_serializer('ExampleResult', ExampleSerializer())
    )
    def get(self, request):
        return Response(ExampleSerializer(request.user).data)


class ExampleCreatedView(ApiResponseMixin, APIView):
    @extend_schema(
        request=None,
        responses={
            201: success_response_serializer('CreatedResult', ExampleSerializer())
        },
    )
    def post(self, request):
        return Response(ExampleSerializer(request.user).data, status=201)


class ExampleEmptyView(ApiResponseMixin, APIView):
    @extend_schema(responses={204: None})
    def delete(self, request):
        return Response(status=204)


class ExampleInvalidView(ApiResponseMixin, APIView):
    @extend_schema(responses={400: ErrorResponseSerializer})
    def get(self, request):
        raise ValidationError({'name': ['Обязательное поле.']})


urlpatterns = [
    *project_urlpatterns,
    path('api/v1/examples/', ExampleListView.as_view(), name='test-examples'),
    path('api/v1/example/', ExampleDetailView.as_view(), name='test-example'),
    path('api/v1/created/', ExampleCreatedView.as_view(), name='test-created'),
    path('api/v1/empty/', ExampleEmptyView.as_view(), name='test-empty'),
    path('api/v1/invalid/', ExampleInvalidView.as_view(), name='test-invalid'),
]


@pytest.fixture(autouse=True)
def test_urlconf(settings):
    settings.ROOT_URLCONF = __name__


@pytest.fixture
def accounts():
    return [
        Account.objects.create_user(phone='+79991234561', full_name='Анна'),
        Account.objects.create_user(phone='+79991234562', full_name='Борис'),
        Account.objects.create_user(phone='+79991234563', full_name='Вера'),
    ]


def test_success_envelope_and_no_content(client, accounts):
    client.force_login(accounts[0])

    detail = client.get('/api/v1/example/')
    assert detail.status_code == 200
    assert detail.json() == {'data': {'id': str(accounts[0].id), 'full_name': 'Анна'}}

    created = client.post('/api/v1/created/')
    assert created.status_code == 201
    assert created.json()['data']['id'] == str(accounts[0].id)

    empty = client.delete('/api/v1/empty/')
    assert empty.status_code == 204
    assert empty.content == b''


def test_pagination_and_filters(client, accounts):
    client.force_login(accounts[0])

    first = client.get('/api/v1/examples/?page_size=1&ordering=-full_name')
    assert first.status_code == 200
    assert [item['full_name'] for item in first.json()['data']] == ['Вера']
    assert first.json()['pagination']['page'] == 1
    assert first.json()['pagination']['page_size'] == 1
    assert first.json()['pagination']['count'] == 3
    assert 'page=2' in first.json()['pagination']['next']
    assert first.json()['pagination']['previous'] is None

    second = client.get('/api/v1/examples/?page_size=1&page=2&ordering=-full_name')
    assert [item['full_name'] for item in second.json()['data']] == ['Борис']

    filtered = client.get('/api/v1/examples/?full_name=Анна')
    assert [item['full_name'] for item in filtered.json()['data']] == ['Анна']
    assert filtered.json()['pagination']['count'] == 1

    empty = client.get('/api/v1/examples/?full_name=Никого')
    assert empty.json()['data'] == []
    assert empty.json()['pagination']['count'] == 0
    assert empty.json()['pagination']['next'] is None

    searched = client.get('/api/v1/examples/?search=Борис')
    assert [item['full_name'] for item in searched.json()['data']] == ['Борис']

    capped = client.get('/api/v1/examples/?page_size=1000')
    assert capped.json()['pagination']['page_size'] == 100


def test_errors_and_session_default(client, accounts):
    anonymous = client.get('/api/v1/examples/')
    assert anonymous.status_code == 403
    assert anonymous.json() == {
        'error': {
            'code': 'not_authenticated',
            'message': anonymous.json()['error']['message'],
            'fields': {},
        }
    }

    client.force_login(accounts[0])
    invalid = client.get('/api/v1/invalid/')
    assert invalid.status_code == 400
    assert invalid.json()['error']['code'] == 'validation_error'
    assert invalid.json()['error']['fields']['name'] == [
        {'code': 'invalid', 'message': 'Обязательное поле.'}
    ]

    invalid_size = client.get('/api/v1/examples/?page_size=bad')
    assert invalid_size.status_code == 400
    assert invalid_size.json()['error']['fields']['page_size'][0]['code'] == 'invalid'

    invalid_filter = client.get('/api/v1/examples/?id=not-a-uuid')
    assert invalid_filter.status_code == 400
    assert invalid_filter.json()['error']['fields']['id'][0]['code'] == 'invalid'

    missing_page = client.get('/api/v1/examples/?page=99')
    assert missing_page.status_code == 404
    assert missing_page.json()['error']['code'] == 'not_found'

    wrong_method = client.patch('/api/v1/example/')
    assert wrong_method.status_code == 405
    assert wrong_method.json()['error']['code'] == 'method_not_allowed'


def test_openapi_matches_response_bodies(client, accounts):
    client.force_login(accounts[0])
    response = client.get('/api/schema/?format=json')
    assert response.status_code == 200
    schema = response.json()

    detail = schema['paths']['/api/v1/example/']['get']['responses']['200']
    detail_ref = detail['content']['application/json']['schema']['$ref']
    detail_name = detail_ref.rsplit('/', 1)[-1]
    assert 'data' in schema['components']['schemas'][detail_name]['properties']

    listing = schema['paths']['/api/v1/examples/']['get']['responses']['200']
    listing_ref = listing['content']['application/json']['schema']['$ref']
    listing_name = listing_ref.rsplit('/', 1)[-1]
    listing_schema = schema['components']['schemas'][listing_name]
    assert set(listing_schema['properties']) == {'data', 'pagination'}
    assert set(listing_schema['properties']['pagination']['properties']) == {
        'page',
        'page_size',
        'count',
        'next',
        'previous',
    }

    error = schema['paths']['/api/v1/invalid/']['get']['responses']['400']
    error_ref = error['content']['application/json']['schema']['$ref']
    error_name = error_ref.rsplit('/', 1)[-1]
    assert 'error' in schema['components']['schemas'][error_name]['properties']


def test_production_routes_have_no_application_endpoint(client, settings):
    settings.ROOT_URLCONF = 'backend.urls'
    assert client.get('/api/v1/examples/').status_code == 404
    assert client.get('/api/schema/').status_code == 200
    assert client.get('/api/docs/').status_code == 200
