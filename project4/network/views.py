from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import *
import json
from .models import User
from django.views.decorators.csrf import csrf_exempt



def index(request):
    return render(request, "network/index.html")

# ---------------------------------------------------------------
def posts(request):

    if request.method == "POST":
        return JsonResponse("request can not be POST")
    all_posts = Post.objects.all()

    all_posts = all_posts.order_by("-date_posted").all()

    return JsonResponse([post.serialize() for post in all_posts], safe=False)


# ---------------------------------------------------------------
def followings_posts(request):
    if request.method == "POST":
        return JsonResponse("request can not be POST")

    followings = Following.objects.filter(user=request.user)
    followings_posts = []
    for following in followings :
        # get posts by the user followed by the logged-in user(request.user)
        posts = Post.objects.filter(user=following.following_user)
        if posts.count() > 0:
            followings_posts.extend(posts)

    # followings_posts = followings_posts.order_by("-date_posted").all()

    return JsonResponse([post.serialize() for post in followings_posts], safe=False)


# ---------------------------------------------------------------
@csrf_exempt
def new_post(request):

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # get JSON data sent with the request
    data = json.loads(request.body)
    content = data.get("content", "")


    if not content:
        return JsonResponse({
            "error": "Post content can not be empty."
        }, status=400)

    post = Post(user=request.user, content=content, likes_num=0, unlikes_num=0)
    post.save()

    return JsonResponse({"Post created successfully."}, status=201)


# ---------------------------------------------------------------
@csrf_exempt
def edit_post(request, post_id):

    if request.method != "PUT":
        return JsonResponse("Error: request method must be PUT!", status=400)

    data = json.loads(request.body)
    newContent = data.get("content", "")
    print(newContent)
    
    if not newContent:
        return JsonResponse({
            "error": "Post content can not be empty."
        }, status=400)

    post = Post.objects.get(user=request.user, id = post_id)
    post.content = newContent
    post.save()

    return JsonResponse({"Post edited successfully."}, status=201)


# ---------------------------------------------------------------
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username=username, email=email, password=password, followers_num=0, following_num=0)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
