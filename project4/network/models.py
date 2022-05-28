from django.contrib.auth.models import AbstractUser
from django.db import models



class User(AbstractUser):
    followers_num = models.IntegerField(null=True)
    following_num = models.IntegerField(null=True)


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "post", null=False)
    content = models.TextField()
    date_posted = models.DateTimeField(auto_now_add=True)
    likes_num = models.IntegerField()
    unlikes_num = models.IntegerField()

    def serialize(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "content": self.content,
            "date_posted": self.date_posted.strftime("%b %d %Y, %I:%M %p"),
            "likes_num": self.likes_num,
            "unlikes_num": self.unlikes_num
        }

class Following(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "follows", null=False)
    following_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "followed", null=False)

    class Meta:
        unique_together = ('user', 'following_user')
    
    def serialize(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "following_username": self.following_user.username
        }

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "followers", null=False)
    follower_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "followings", null=False)

    class Meta:
        unique_together = ('user', 'follower_user')

    def selrialize(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "follower_username": self.follower_user.username
        }
    

    
