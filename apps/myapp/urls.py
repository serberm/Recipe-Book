from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^get_data$', views.get_data),
    url(r'^new_recipe_form$', views.new_recipe_form),
    url(r'^add_recipe$', views.add_recipe),
    url(r'^selected_ingredient_data$', views.selected_ingredient_data),
    url(r'^update_data$', views.update_data),
    url(r'^get_list_ingredients$', views.get_list_ingredients),
]
