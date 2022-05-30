document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#all-posts-link').addEventListener('click', () => load_all_posts());

    if(document.querySelector('#following-link') !== null) {
        document.querySelector('#following-link').addEventListener('click', () => load_followings_posts());
    }

    if(document.querySelector('#post-submit') !== null) {
        document.querySelector('#post-submit').addEventListener('click', () => create_post());
    }

    if(document.querySelector('#request_username') !== null){
        const username = document.querySelector('#request_username').textContent;
        document.querySelector('#request_username').addEventListener('click', () => display_profile(username));
    }

    load_all_posts();
});

function load_all_posts() {
    // Single page applications rule - make one div show as required by user
    document.querySelector('#followings-posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#next-button').style.display = 'none';
    document.querySelector('#previous-button').style.display = 'none';
    document.querySelector('#new-post').style.display = 'block';
    document.querySelector('#all-posts').style.display = 'block';


    // send http request to the server/database to get the needed data (in this case: all posts)
    fetch('posts/all')
    .then(response => response.json())
    .then(posts => {
        console.log(posts)
        posts.forEach(post => { 
            display_post(post, 'all-posts');
        });
    });
    // clear html element to avoid acumulation
    document.querySelector('#all-posts').innerHTML = '';
}

function load_followings_posts() {
    // Single page applications rule - make one div show as required by user
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#next-button').style.display = 'none';
    document.querySelector('#previous-button').style.display = 'none';
    document.querySelector('#new-post').style.display = 'block';
    document.querySelector('#followings-posts').style.display = 'block';

    // send http request to the server/databse to get the following posts
    fetch('posts/followings')
    .then(response => response.json())
    .then(posts => {

        posts.forEach(post => {
            display_post(post, 'followings-posts');
        });
    });

    // clear html element to avoid acumulation
    document.querySelector('#followings-posts').innerHTML = ''
}

function display_profile(username){
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#next-button').style.display = 'none';
    document.querySelector('#previous-button').style.display = 'none';
    document.querySelector('#new-post').style.display = 'none';
    document.querySelector('#followings-posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';


    fetch(`user_info/${username}`)
    .then(response => response.json())
    .then(user_info => {

        // add user info to profile div
        const profileDiv = document.createElement('div');
        profileDiv.innerHTML = `
        <div id="profile-username">${username}</div>
        <div class="profile-follow-label">Followers:</div>
        <div id="followers-num-${username}" class="profile-follow-num">${user_info.followers_num}</div>
        <div class="profile-follow-label">Followings:</div>
        <div id="followings-num-${username}" class="profile-follow-num">${user_info.following_num}</div>
        `;

        // if user is the owner of profile, then do NOT show follow and unfollow
        const request_username = document.querySelector('#request_username').textContent;
        if(request_username !== username){
            console.log(request_username, username)
            profileDiv.innerHTML += `
            <div id="follow-${username}"><button>Follow</button></div>
            <div id="unfollow-${username}"><button>Unfollow</button></div>
            `;

        }

        document.querySelector('#profile').append(profileDiv);
        
        if(document.querySelector(`#follow-${username}`)){
            document.querySelector(`#follow-${username}`).addEventListener('click', () => follow_person(username, request_username, 'follow'));
        }
        if(document.querySelector(`#unfollow-${username}`)){
            document.querySelector(`#unfollow-${username}`).addEventListener('click', () => follow_person(username, request_username, 'unfollow'));
        }
        
    });

    // document.querySelector('#profile').append('<h1 class="posts-headers">Posts</h1>');

    fetch(`user_posts/${username}`)
    .then(response => response.json())
    .then(user_posts => {
        console.log(user_posts)

        user_posts.forEach(post => {
            display_post(post, 'profile');
        });
        
    });

    // clear html element to avoid acumulation
    document.querySelector('#profile').innerHTML = '';

}

function follow_person(username, request_username, buttonChoice){

    // fetch Following model and decide upon it wether to allow the user follow or infollow (enable only one of these buttons)

    let request_user_followings = 0;
    fetch(`user_info/${request_username}`)
    .then(response => response.json())
    .then(user_info => {

        request_user_followings = user_info.following_num;
    });


    let followersNum, followingsNum;
    if(buttonChoice === 'follow'){
        followersNum = ++document.querySelector(`#followers-num-${username}`).innerHTML;
        followingsNum = ++(request_user_followings);
        console.log('followingsNum');
        console.log(followingsNum);
    } else {
        followersNum = --document.querySelector(`#followers-num-${username}`).innerHTML;
        followingsNum = --request_user_followings;
    }

    // edit number of followers and followings for usernames
    fetch(`/user_follow`, {
      method: 'PUT',
      body: JSON.stringify({
        username: username,
        followers_num: followersNum
      })
    });
    fetch(`/user_follow`, {
      method: 'PUT',
      body: JSON.stringify({
        username: request_username,
        following_num: followingsNum
      })
    });

    // add or delete Following object
    if(buttonChoice === 'follow'){
        fetch('/edit_following', {
        method: 'POST',
        body: JSON.stringify({
            follower_user: request_username,
            following_user: username
        })
        })
        .then( response => response.json())
        .then(result => {
            console.log(result)         
        });
    } else {
        fetch('/edit_following', {
        method: 'DELETE',
        body: JSON.stringify({
            follower_user: request_username,
            following_user: username,
        })
        })
        .then( response => response.json())
        .then(result => {
            console.log(result)         
        });
    }
}

function display_post(post, elementId){
    console.log(post);
    
    const postDiv = document.createElement('div');
    postDiv.className = 'post-div';
    postDiv.innerHTML = `
    <div id="post-${post.id}-${elementId}">
        <div class="username" id="username-${post.id}-${elementId}">
            ${post.username}
        </div> 
        <div class="content" id="content-${post.id}-${elementId}"> 
            ${post.content} 
        </div>
        <div class="date" id="date-posted-${post.id}-${elementId}"> 
            ${post.date_posted}  
        </div>
        <div class="like" id="like-${post.id}-${elementId}">
            <button id="like-button-${post.id}-${elementId}">Like</button>
        </div>
        <div class="likes" >
            <div id="likes-div-${post.id}-${elementId}">${post.likes_num}</div>
        </div>
    </div>
    `;

    // show the edit button only if the user is the owner of the post
    const request_username = document.querySelector('#request_username').textContent;
    if (request_username === post.username){
        postDiv.innerHTML += `
        <div class="edit" id="edit-${post.id}-${elementId}">
            <a href="#" class="link-primary">Edit</a>
        </div>
        `;
    }

    // access html element with id:all-posts and add the above data to it
    document.querySelector(`#${elementId}`).append(postDiv);

    
    // check if user liked a post or not
    fetch('likes')
    .then(response => response.json())
    .then(likes => {
        // user has liked this post.
        if(likes.find(like => like.liked_post_id === post.id)){
            document.querySelector(`#like-${post.id}-${elementId}`).style.backgroundColor = 'red';
            document.querySelector(`#like-${post.id}-${elementId}`).addEventListener('click', () => like_post(post, 'unlike', elementId));
        } else{
            document.querySelector(`#like-${post.id}-${elementId}`).style.backgroundColor = 'green';
            document.querySelector(`#like-${post.id}-${elementId}`).addEventListener('click', () => like_post(post, 'like', elementId));
        }
    });

    // Adding event listeners to buttons and username div
    if(document.querySelector(`#edit-${post.id}-${elementId}`)){
        document.querySelector(`#edit-${post.id}-${elementId}`).addEventListener('click', () => edit_post(post.id, post.content, elementId));
    }
    if(elementId !== 'profile'){
        document.querySelector(`#username-${post.id}-${elementId}`).addEventListener('click', () => display_profile(post.username));
    }

    console.log(document.querySelector(`#like-${post.id}-${elementId}`));
}

function create_post(){

    const content = document.querySelector('#post-content').value;
    console.log(content);

    fetch('/new_post', {
        method: 'POST',
        body: JSON.stringify({
            content: content  
        })
    })
    .then( response => response.json())
    .then(result => {
        console.log(result)         
    });
}

function edit_post(postId, postContent, elementId){

    newPostDiv = document.createElement('div');
    newPostDiv.innerHTML = `
    <form id="edit-post-form">
            <textarea class="form-control" name="new-content" id="new-content-${postId}-${elementId}" placeholder="Edit Post">${postContent}</textarea>
            <input class="btn btn-primary mb-2" id="change-submit-${postId}-${elementId}" type="submit" value="Submit">
    </form>
    `;

    document.querySelector(`#post-${postId}-${elementId}`).innerHTML = '';
    document.querySelector(`#post-${postId}-${elementId}`).append(newPostDiv);
    
    // at submit, change post content in the database using API fetch
    document.querySelector(`#change-submit-${postId}-${elementId}`).addEventListener('click', () => {
        const newContent = document.querySelector(`#new-content-${postId}-${elementId}`).value;
        console.log(newContent);

        fetch(`edit_post/${postId}`, {
            method: 'PUT',
            body: JSON.stringify({
                content: newContent
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        });
    });

}

function like_post(post, buttonChoice, elementId){

    // fetch Like model and check if user already liked the post and upon it disable or keep the button enabled
    let likesNum;
    if(buttonChoice === 'like'){
        document.querySelector(`#like-${post.id}-${elementId}`).style.backgroundColor = 'red';
        likesNum = ++document.querySelector(`#likes-div-${post.id}-${elementId}`).innerHTML;
        fetch(`/edit_likes`, {
            method: 'PUT',
            body: JSON.stringify({
                id: post.id,
                likes_num: likesNum
            })
        });
    } else {
        document.querySelector(`#like-${post.id}-${elementId}`).style.backgroundColor = 'green';
        likesNum = --document.querySelector(`#likes-div-${post.id}-${elementId}`).innerHTML;
        fetch(`/edit_likes`, {
            method: 'DELETE',
            body: JSON.stringify({
                id: post.id,
                likes_num: likesNum
            })
        });
    }

}



// PAGINATION------------------------------------------------------------------------------------------

// get the number of posts from database
// let postsNum;
// fetch('posts')
// .then(response => response.json())
// .then(posts => {
//     postsNum = posts.count();
//     console.log(postsNum);
// });
// // using the number of posts + the new post, calculate the number of pages needed
// totalPosts = postsNum + 1;
// totalPages = Math.ceil(totalPosts / 10);
// // using the number of pages we have add HTML elemnts for loop
// for (let i =0; i < totalPages; i++){
//     const page = document.createElement('div');

//     for (let j=0; j<10; j++){

//     }

//     page.innerHTML = `
    

//     `;


// }


// totalPosts.forEach(post => {

// });
// using the number of posts we have add HTML elements for loop