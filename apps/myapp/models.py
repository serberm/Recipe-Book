from django.db import models


class Recipe(models.Model):
  name = models.CharField(max_length=45)
  description = models.TextField()

  def __repr__(self):
    return f"{self.name}"


class Ingredient(models.Model):
  name = models.CharField(max_length=20)
  recepies = models.ManyToManyField(Recipe, related_name="ingredients")
  
  def __repr__(self):
    return f"{self.name}"
