from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import *
import json
from .models import User
from django.views.decorators.csrf import csrf_exempt



# ---------------------------------------------------------------
def index(request):
    return render(request, "network/index.html")

# ---------------------------------------------------------------
def posts(request, post_type):

    if request.method == "POST":
        return JsonResponse("request can not be POST")

    if post_type == 'all':
        posts = Post.objects.all()
        posts = posts.order_by("-date_posted").all()

    elif post_type == 'followings':
        followings = Following.objects.filter(follower_user=request.user)
        posts = []
        for following in followings :
            # get posts by the user followed by the logged-in user(request.user)
            print(following.following_user)
            user_posts = Post.objects.filter(user=following.following_user)

            if user_posts.count() > 0:
                posts.extend(user_posts)
    return JsonResponse([post.serialize() for post in posts], safe=False)

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

    post = Post(user=request.user, content=content, likes_num=0)
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
def user_info(request, username):
    if request.method == "POST":
        return JsonResponse("request can not be POST")

    user = User.objects.get(username=username)

    return JsonResponse(user.serialize(), safe=False)

# ---------------------------------------------------------------
def user_posts(request, username):

    if request.method == "POST":
        return JsonResponse("request can not be POST")
    
   
    user = User.objects.get(username=username)
    posts = Post.objects.filter(user=user)
    posts = posts.order_by("-date_posted").all()

    return JsonResponse([post.serialize() for post in posts], safe=False)

# ---------------------------------------------------------------
@csrf_exempt
def edit_likes(request):
    data = json.loads(request.body)
    likes_nums = data.get("likes_num", "")
    post_id = data.get("id", "")
    post = Post.objects.get(id=post_id)
    post.likes_num = likes_nums
    post.save()

    # assign Like to user
    if request.method == "PUT":
        Like(user=request.user, liked_post_id = post_id).save()
    elif request.method == "DELETE":
        Like.objects.get(user=request.user, liked_post_id = post_id).delete()
    else:
        return JsonResponse("Error: request method must be PUT or DELETE!", status=400)

    return HttpResponse(status=204)

# ---------------------------------------------------------------
@csrf_exempt
def edit_following(request):
    data = json.loads(request.body)
    follower_username = data.get("follower_user", "")
    follower_user = User.objects.get(username=follower_username)
    following_username = data.get("following_user", "")
    following_user = User.objects.get(username=following_username)

    if request.method == "POST":
        follow = Following(follower_user=follower_user, following_user=following_user)
        follow.save()
    elif request.method == "DELETE":
        follow = Following.objects.get(follower_user=follower_username, following_user=following_username)
        follow.delete()
    else:
        return JsonResponse("Error: request method must be POST or DELETE!", status=400)

    return HttpResponse(status=204)

# ---------------------------------------------------------------
@csrf_exempt
def user_follow(request):
    if request.method != "PUT":
        return JsonResponse("Error: request method must be PUT!", status=400)
    data = json.loads(request.body)
    username = data.get("username", "")
    followers_number = data.get("followers_num", "")
    followings_number = data.get("following_num", "")

    user = User.objects.get(username=username)
    print("username", username, user.username)
    if followers_number != '' and followers_number is not None:
        user.followers_num = (followers_number)
        # print(user.followers_num, "nnnnnnnnnnnnnnnnnnnnnnnnnn")
    if followings_number != '' and followings_number is not None:
        user.following_num = (followings_number)
    user.save()

    return HttpResponse(status=204)

# ---------------------------------------------------------------
def get_likes(request, post_id):
    post = Post.objects.get(user=request.user, id=post_id)
    return JsonResponse(post.serialize(), safe=False)

def likes(request):
    likes = Like.objects.filter(user=request.user)
    return JsonResponse([like.serialize() for like in likes], safe=False)

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

# ---------------------------------------------------------------
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

# ---------------------------------------------------------------
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
