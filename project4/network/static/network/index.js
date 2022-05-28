document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#all-posts-link').addEventListener('click', () => load_all_posts());

    if(document.querySelector('#following-link') !== null) {
        document.querySelector('#following-link').addEventListener('click', () => load_following_posts());
    }

    if(document.querySelector('#post-submit') !== null) {
        document.querySelector('#post-submit').addEventListener('click', () => create_post())
    }

    load_all_posts();
});


function load_all_posts() {
    // Single page applications rule - make one div show as required by user
    document.querySelector('#followings-posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#next-button').style.display = 'none';
    document.querySelector('#previous-button').style.display = 'none';
    document.querySelector('#edit-post').style.display = 'none';
    document.querySelector('#like-post').style.display = 'none';
    document.querySelector('#unlike-post').style.display = 'none';
    document.querySelector('#new-post').style.display = 'block';
    document.querySelector('#all-posts').style.display = 'block';


    // send http request to the server/database to get the needed data (in this case: all posts)
    fetch('posts')
    .then(response => response.json())
    .then(posts => {
        console.log(posts)
        posts.forEach(post => { 
            
            const postDiv = document.createElement('div');
            postDiv.innerHTML = `
            <div id="post-${post.id}">
                Post: ${post.id} -- ${post.username} ${post.content} ${post.date_posted} ${post.likes_num} <div id="edit-${post.id}">
                    <button>Edit</button>
                </div>
                <div id="like-${post.id}">
                    <button>Like ${post.likes_num}</button>
                </div>
                <div id="dislike-${post.id}">
                    <button>Dislike ${post.unlikes_num}</button>
                </div>
            </div>
            `;

            // access html element with id:all-posts and add the above data to it
            document.querySelector('#all-posts').append(postDiv);
            // POSSIBLE OPTIMIZATION HERE
            document.querySelector(`#edit-${post.id}`).addEventListener('click', () => edit_post_view(post.id, post.content));
            document.querySelector(`#like-${post.id}`).addEventListener('click', () => edit_post_likes(post.id, post.likes_num));
            document.querySelector(`#dislike-${post.id}`).addEventListener('click', () => edit_post_unlikes(post.id, post.unlikes_num));

        });
    });

    document.querySelector('#all-posts').innerHTML = '';
}

function load_following_posts() {
    // Single page applications rule - make one div show as required by user
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#next-button').style.display = 'none';
    document.querySelector('#previous-button').style.display = 'none';
    document.querySelector('#edit-post').style.display = 'none';
    document.querySelector('#like-post').style.display = 'none';
    document.querySelector('#unlike-post').style.display = 'none';
    document.querySelector('#new-post').style.display = 'block';
    document.querySelector('#followings-posts').style.display = 'block';

    // send http request to the server/databse to get the following posts
    fetch('followings_posts')
    .then(response => response.json())
    .then(posts => {

        posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.innerHTML = `Post: ${post.id} -- ${post.username} ${post.content} ${post.date_posted} ${post.likes_num}`;

            // access html element with id:following-posts and add the above data to it
            document.querySelector('#followings-posts').append(postDiv)

        });
    });

    document.querySelector('#followings-posts').innerHTML = ''
}


function create_post(){
    const content = document.querySelector('#post-content').value;

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

function edit_post_view(postId, postContent){

    newPostDiv = document.createElement('div');
    newPostDiv.innerHTML = `
    <form id="edit-post-form">
            <textarea name="new-content" id="new-content-${postId}" placeholder="Edit Post">${postContent}</textarea>
            <input id="change-submit-${postId}" type="submit" value="Submit">
    </form>
    `;

    document.querySelector(`#post-${postId}`).innerHTML = '';
    document.querySelector(`#post-${postId}`).append(newPostDiv);
    
    document.querySelector(`#change-submit-${postId}`).addEventListener('click', () => edit_post(postId, postContent));

}


function edit_post(postId, postContent){

    // connect to API route to change the content of the post
    const newContent = document.querySelector(`#new-content-${postId}`).value;
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
}

function edit_post_likes(postId, likesNum){
    // connect to API route to change the content of the post

    const likes = likesNum++;

    fetch(`edit_post/${postId}`, {
        method: 'PUT',
        body: JSON.stringify({
            likes: likes,
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    });
}