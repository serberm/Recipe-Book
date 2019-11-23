from django.shortcuts import render, redirect, HttpResponse
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .models import Recipe, Ingredient

def index(request):
  return render(request, 'myapp/index.html')


#function for creating data tree object
def createSingleTree(obj_data, list_data, index):

  if isinstance(obj_data, list):
    createSingleTree(obj_data[index], list_data, index)
    

  if len(list_data) == index:
    return obj_data

  if isinstance(obj_data, dict):
    if len(obj_data['children']) == 0:
      for element in list_data:
        obj_data['children'].append({'name': element, 'children': []})
    if len(obj_data['children']) > 0:
      if obj_data['name'] in list_data:
        list_data.remove(obj_data['name'])
      createSingleTree(obj_data['children'], list_data, index)

  return createSingleTree(obj_data, list_data, index)


def get_data_WRONG_ONE(request):
  #obtaining list of names of ingredients from database
  ingredients_dict = Ingredient.objects.all()
  ingredient_list = []
  for element in ingredients_dict:
    ingredient_list.append(element.name)
  
  
  ingredient_obj = {
                      "name": ingredient_list[0],
                      "children": [],
                    }
    
  for index in range(0, len(ingredient_list)):
    ingredient_obj = createSingleTree(ingredient_obj, ingredient_list, index)
    #RESET LIST TO EMPTY AND REFILL WITH INGREDIENTS FOR ANOTHER ROUND
    ingredient_list = []
    for element in ingredients_dict:
      ingredient_list.append(element.name)
    ingredient_list.append('')

  context = {
      'data': [ingredient_obj]
  }
  return JsonResponse(context)


@csrf_exempt
def get_data(request):
  received_data = request.POST
  for key in received_data:
    data_obj = json.loads(key)

  start_ingredient = data_obj['first_ingredient']
  ingredients_dict = Ingredient.objects.all()
  ingredient_list = []
  for element in ingredients_dict:
    ingredient_list.append(element.name)

  index = ingredient_list.index(start_ingredient)

  ingredient_obj = {
      "name": ingredient_list[index],
      "children": [],
  }

  context = {
      'data': [ingredient_obj]
  }
  return JsonResponse(context)


@csrf_exempt
def update_data(request):
  received_data = request.POST
  for key in received_data:
    data_list = json.loads(key)
  
  ingredient_name_list = []
  all_ingredients = Ingredient.objects.all()
  for ingredient in all_ingredients:
    if ingredient.name not in data_list:
      ingredient_name_list.append(ingredient.name)
  context = {
      'data': [ingredient_name_list]
  }
  return JsonResponse(context)




def new_recipe_form(request):
  return render(request, 'myapp/new_recipe_form.html')


# updating session with chips ingredients from new recipe form
@csrf_exempt
def add_recipe(request):
  received_data = request.POST
  for key in received_data:
    dict_data = json.loads(key)
    name = dict_data['recipe_name']
    description = dict_data['description']
    list_chips = dict_data['chips_data']
    Recipe.objects.create(name=name, description=description)
    for element in list_chips:
      if len(Ingredient.objects.filter(name=element)) == 0:
        Ingredient.objects.create(name=element)
        Recipe.objects.last().ingredients.add(Ingredient.objects.last())
      else:
        Recipe.objects.last().ingredients.add(Ingredient.objects.get(name=element))
  return HttpResponse('ok')


@csrf_exempt
def selected_ingredient_data(request):
  received_data = request.POST
  # for key in received_data:
  #   data_list = json.loads(key)
  
  # ingredients_name_list = []
  # all_recipes = Recipe.objects.all()
  # for recipe in all_recipes:
  #   for ingredient in recipe.ingredients.all():
  #     ingredients_name_list.append(ingredient.name)
  #   ingredients_name_list.sort()
  #   data_list.sort()
  #   if ingredients_name_list == data_list:
  #     print(recipe.name)
  return HttpResponse('ok')


def get_list_ingredients(request):
  all_ingredients_list = []
  all_ingredients = Ingredient.objects.all()
  for element in all_ingredients:
    all_ingredients_list.append(element.name)
  context = {
      'data': all_ingredients_list
  }
  return JsonResponse(context)


