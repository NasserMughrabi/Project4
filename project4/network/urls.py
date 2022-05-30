
from unicodedata import name
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API paths
    path("posts/<str:post_type>", views.posts, name="posts"),
    path("user_posts/<str:username>", views.user_posts, name="user_posts"),
    path("new_post", views.new_post, name="new_post"),
    path("edit_post/<int:post_id>", views.edit_post, name="edit_post"),
    path("user_info/<str:username>", views.user_info, name="user_info"),
    path("edit_likes", views.edit_likes, name="edit_likes"),
    path("edit_following", views.edit_following, name="edit_following"),
    path("user_follow", views.user_follow, name="user_follow"),
    path("get_likes/<int:post_id>", views.get_likes, name="get_likes"),
    path("likes", views.likes, name="likes"),

]
