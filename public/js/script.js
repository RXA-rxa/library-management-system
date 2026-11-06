// 获取 token（从页面元素或 session）
const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

// 点赞
document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const bookId = this.dataset.id;
        const res = await fetch('/interact/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ bookId })
        });
        const data = await res.json();
        if (data.success) {
            this.querySelector('span')?.textContent = data.count;
            this.classList.toggle('btn-outline-primary');
            this.classList.toggle('btn-primary');
        } else {
            alert(data.message || '操作失败');
        }
    });
});

// 收藏
document.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const bookId = this.dataset.id;
        const res = await fetch('/interact/fav', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ bookId })
        });
        const data = await res.json();
        if (data.success) {
            this.querySelector('span')?.textContent = data.count;
            this.classList.toggle('btn-outline-danger');
            this.classList.toggle('btn-danger');
        } else {
            alert(data.message || '操作失败');
        }
    });
});

// 评论
document.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const bookId = this.dataset.id;
        const content = prompt('请输入评论内容：');
        if (content) {
            fetch('/interact/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ bookId, content })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) alert('评论成功');
                else alert(data.message || '评论失败');
            })
            .catch(err => alert('请求出错'));
        }
    });
});

// 借阅
document.querySelectorAll('.borrow-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const bookId = this.dataset.id;
        if (!confirm('确认借阅该书？')) return;
        const res = await fetch('/borrow/borrow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ bookId })
        });
        const data = await res.json();
        alert(data.message || (data.success ? '借阅成功' : '借阅失败'));
        if (data.success) location.reload();
    });
});