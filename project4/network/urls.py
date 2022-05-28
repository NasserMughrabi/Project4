
from unicodedata import name
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API paths

    path("posts", views.posts, name="posts"),
    path("followings_posts", views.followings_posts, name="followings_posts"),
    path("new_post", views.new_post, name="new_post"),
    path("edit_post/<int:post_id>", views.edit_post, name="edit_post"),

]
