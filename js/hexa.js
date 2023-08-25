let session = new Session();
session_id = session.getSession();

if (session_id !== '') {
  async function populateUserData() {
    let user = new User();
    user = await user.get(session_id);

    document.querySelector('#username').innerText = user['username'];
    document.querySelector('#email').innerText = user['email'];
    document.querySelector('#followers').innerText = user['followers'];
    document.querySelector('#posts').innerText = user['posts'];
    if (
      document.querySelector('#username').innerText == '' &&
      document.querySelector('#email').innerText == '' &&
      document.querySelector('#username').innerText == 'undefined' &&
      document.querySelector('#email').innerText == 'undefined'
    ) {
      window.location.href = 'index.html';
      session.destroySession();
    }

    document.querySelector('#korisnicko_ime').value = user['username'];
    document.querySelector('#edit_email').value = user['email'];
    document.querySelector('#edit_lozinka').value = user['password'];
  }
  populateUserData();
} else {
  window.location.href = 'index.html';
}
document.querySelector('#logout').addEventListener('click', (e) => {
  e.preventDefault();
  session.destroySession();
  window.location.href = 'index.html';
});

document.querySelector('#editAccount').addEventListener('click', () => {
  document.querySelector('.custom-modal').style.display = 'block';
});
document.querySelector('#closeModal').addEventListener('click', () => {
  document.querySelector('.custom-modal').style.display = 'none';
});

document.querySelector('#show').addEventListener('click', (e) => {
  e.preventDefault();
  let dugme = document.querySelector('#show');
  let polje = document.querySelector('#edit_lozinka');

  if (dugme.innerText == 'Show') {
    polje.setAttribute('type', 'text');
    dugme.innerText = 'Hide';
  } else if (dugme.innerText == 'Hide') {
    polje.setAttribute('type', 'password');
    dugme.innerText = 'Show';
  }
});

document.querySelector('#editForm').addEventListener('submit', (e) => {
  e.preventDefault();

  let user = new User();
  user.username = document.querySelector('#korisnicko_ime').value;
  user.email = document.querySelector('#edit_email').value;
  user.password = document.querySelector('#edit_lozinka').value;
  user.edit();
});

document.querySelector('#deleteProfile').addEventListener('click', (e) => {
  e.preventDefault();

  let text = 'Da li ste sigurni da zelite da obrisete profil?';

  if (confirm(text) === true) {
    let user = new User();
    user.delete();
  }
});

document.querySelector('#postForm').addEventListener('submit', (e) => {
  e.preventDefault();

  async function createPost() {
    let content = document.querySelector('#postContent').value;
    document.querySelector('#postContent').value = '';
    let post = new Post();
    post.post_content = content;
    post = await post.create();

    let current_user = new User();
    current_user = await current_user.get(session_id);

    let delete_post_html = '';
    if (session_id == post.userid) {
      delete_post_html =
        '<button class="remove-btn" onclick="removeMyPost(this)">Remove</button>';
    }
    let html = document.querySelector('#allPostsWrapper').innerHTML;
    document.querySelector('#allPostsWrapper').innerHTML =
      `<div class="single-post" data-post_id="${post.id}">
    <div class="post-content">${post.content}</div>
    
      <div class="post-action">
        <p><b>User:</b> ${current_user.username}</p>
        <div>
          <button onclick="likePost(this)" class="likePostJS like-btn"><span>${post.likes}</span> Likes</button>
          <button onclick="commentPost(this)" class="comment-btn">Comments</button>
          ${delete_post_html}
        </div>
      </div>

    <div class="post-comments">
    <form>
    <input placeholder="Napisi komentar... " type="text">
    <button onclick="commentPostSubmit(event)">Comment</button>
    </form>
    </div>
    </div> ` + html;
  }
  createPost();
});

async function getAllPosts() {
  let all_posts = new Post();
  all_posts = await all_posts.getAllPosts();

  all_posts.forEach((post) => {
    let delete_post_html = '';
    if (session_id == post.user_id) {
      delete_post_html =
        '<button class="remove-btn" onclick="removeMyPost(this)">Remove</button>';
    }
    async function getPostUser() {
      let user = new User();
      user = await user.get(post.user_id);

      let comments = new Comment();
      comments = await comments.get(post.id);

      let comments_html = '';
      if (comments.length > 0) {
        for (const comment of comments) {
          let commentUser = new User();
          commentUser = await commentUser.get(comment.user_id);

          comments_html += `
            <div class="single-comment">
              <p><b>User:</b> ${commentUser.username}</p>
              ${comment.content}
            </div>`;
        }
      }

      let html = document.querySelector('#allPostsWrapper').innerHTML;
      document.querySelector('#allPostsWrapper').innerHTML =
        `<div class="single-post" data-post_id="${post.id}">
    <div class="post-content">${post.content}</div>
    
      <div class="post-action">
        <p><b>User:</b> ${user.username}</p>
        <div>
          <button onclick="likePost(this)" class="likePost like-btn"><span>${post.likes}</span> Likes</button>
          <button onclick="commentPost(this)" class="comment-btn">Comments</button>
          ${delete_post_html}
        </div>
      </div>

    <div class="post-comments">
    <div class="input">
    <form>
    <input class="col-md-12 " placeholder="Napisi komentar... " type="text">
    <button class="col-md-12 mt-2" onclick="commentPostSubmit(event)">Comment</button>
    </form>
    </div>
    <div class="content">
    ${comments_html}
    </div>
    </div>
    </div> ` + html;
    }
    getPostUser();
  });
}
getAllPosts();
const commentPostSubmit = async (e) => {
  e.preventDefault();

  let btn = e.target;
  let main_post_el = btn.closest('.single-post');
  let post_id = main_post_el.getAttribute('data-post_id');
  let comment_value = main_post_el.querySelector('input').value;

  let user = new User();
  let user_info = await user.get(session_id);

  main_post_el.querySelector('.post-comments').innerHTML += `
    <div class="single-comment">
      <p><b>User:</b> ${user_info.username}</p>
      ${comment_value}
    </div>
  `;

  // Create the comment
  let comment = new Comment();
  comment.content = comment_value;
  comment.user_id = session_id;
  comment.post_id = post_id;
  comment.create();
};

const removeMyPost = (btn) => {
  let post_id = btn.closest('.single-post').getAttribute('data-post_id');

  let text = 'Da li ste sigurni da zelite da obrisete Objavu?';

  if (confirm(text) === true) {
    // Remove the post HTML element
    btn.closest('.single-post').remove();

    // Delete the post and its associated comments
    let post = new Post();
    post.delete(post_id).then(() => {
      // Fetch and delete comments associated with the post
      let comments = new Comment();
      comments.get(post_id).then((postComments) => {
        postComments.forEach((comment) => {
          comments.delete(comment.id).then(() => {
            console.log(`Comment with ID ${comment.id} deleted.`);
          });
        });
      });
    });

    let user = new User();

    // Update the number of posts
    let numberOfPosts = parseInt(document.querySelector('#posts').innerText);
    user.postUpdate(session_id, numberOfPosts - 1);
  }
};

const likePost = (btn) => {
  let post_id = btn.closest('.single-post').getAttribute('data-post_id');
  let number_of_likes = parseInt(btn.querySelector('span').innerText);

  btn.querySelector('span').innerText = number_of_likes + 1;
  btn.setAttribute('disabled', 'true');

  let post = new Post();
  post.like(post_id, number_of_likes + 1);
};

const commentPost = (btn) => {
  let main_post_el = btn.closest('.single-post');
  let post_id = main_post_el.getAttribute('data-post_id');

  if (main_post_el.querySelector('.content').classList.contains('activee')) {
    main_post_el.querySelector('.content').classList.remove('activee');
  } else {
    main_post_el.querySelector('.content').classList.add('activee');
  }
};
