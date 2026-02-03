document.addEventListener('DOMContentLoaded', () => {
    // スクロール時に要素をフェードインさせる
    const observerOptions = {
        root: null, // ビューポート
        rootMargin: '0px',
        threshold: 0.1 // 10%が見えたら発火
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 一度表示したら監視を終了
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
});


document.addEventListener("DOMContentLoaded", () => {
    const csvUrl = './members.csv'; // CSVファイルのパス

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            renderMembers(results.data);
        }
    });
});

function renderMembers(data) {
    const container = document.getElementById('member-app');
    if (!container) return;
    container.innerHTML = ''; // 読み込み中メッセージを消去

    // 1. カテゴリ（2025年度, Alumni）ごとにグループ化
    const categories = [...new Set(data.map(item => item.Category))];

    categories.forEach(cat => {
        if (!cat) return;
        const section = document.createElement('div');
        section.className = cat === 'Alumni' ? 'alumni-section' : 'member-year-section';
        
        // タイトル設定
        if (cat === 'Alumni') {
            // Alumni（卒業生）の場合は「OB/OG」という大きな見出しを追加
            const alumniTitle = document.createElement('h2');
            alumniTitle.className = 'year-label-lg';
            alumniTitle.textContent = 'OB/OG';
            section.appendChild(alumniTitle);
        } else {
            // 2025 などの年度の場合はそのまま表示
            section.innerHTML = `<h2 class="year-label-lg">${cat}年度</h2>`;
        }

        // 2. 学年（M2, M1など）ごとにグループ化
        const catData = data.filter(d => d.Category === cat);
        const grades = [...new Set(catData.map(item => item.Grade))];

        grades.forEach(grade => {
            if (!grade) return;
            const gradeGroup = document.createElement('div');
            gradeGroup.className = 'grade-group';
            gradeGroup.innerHTML = `<h3 class="grade-title">${grade}</h3>`;

            const list = document.createElement('ul');
            list.className = 'member-list';

            const members = catData.filter(d => d.Grade === grade);
            members.forEach(m => {
                if (!m.Name) return;
                const li = document.createElement('li');
                li.textContent = m.Note ? `${m.Name}（${m.Note}）` : m.Name;
                list.appendChild(li);
            });

            gradeGroup.appendChild(list);
            section.appendChild(gradeGroup);
        });

        container.appendChild(section);
    });
}