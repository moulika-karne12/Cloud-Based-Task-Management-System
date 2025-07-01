# tasks/pagination.py
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page_size': self.page.paginator.per_page,  # dynamic page size
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
# This pagination class can be used in views to provide consistent pagination responses
# and allow clients to specify their own page size if needed.