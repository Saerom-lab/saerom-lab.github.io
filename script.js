// 1. フェードイン用のオブザーバーを共通の変数として定義
let fadeInObserver;

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-placeholder', 'header.html', () => {
        initNavigation();
        initHamburger();
    });
    
    loadComponent('footer-placeholder', 'footer.html');
    
    // オブザーバーの初期設定
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 最初からHTMLに書かれている .fade-in 要素を監視開始
    const staticFadeElements = document.querySelectorAll('.fade-in');
    staticFadeElements.forEach(el => fadeInObserver.observe(el));

    // --- CSV読み込み処理 ---
    if (document.getElementById('member-app')) {
        loadCSV('./csv/members.csv', renderMembers);
    }
    if (document.getElementById('works-app')) {
        loadCSV('./csv/works.csv', renderWorks);
    }
    // --- プロジェクトギャラリーの読み込み処理 --- 
    if (document.getElementById('project-gallery-app')) {
        loadCSV('./csv/projects.csv', (data) => renderGallery(data, 'project-gallery-app'));
    }
    // --- 研究室ギャラリーの読み込み処理 --- 
    if (document.getElementById('laboratory-gallery-app')) {
        loadCSV('./csv/laboratory.csv', (data) => renderGallery(data, 'laboratory-gallery-app'));
    }
});

async function loadComponent(id, file, callback) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;

    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        const data = await response.text();
        placeholder.innerHTML = data;
        
        if (callback) callback();
    } catch (error) {
        console.error('コンポーネントの読み込みに失敗しました:', error);
    }
}

// ナビゲーションのハイライト処理
function initNavigation() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('text-mint');
        }
    });
}

// ハンバーガーメニューの処理
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// CSV読み込みの共通関数
function loadCSV(url, callback) {
    if (typeof Papa === 'undefined') return;
    Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results && results.data) {
                callback(results.data);
            }
        },
        error: function(err) {
            console.error("CSVの読み込みエラー:", url, err);
        }
    });
}

// 業績ページのレンダリング
function renderWorks(data) {
    const container = document.getElementById('works-app');
    container.innerHTML = '';

    const categoryEn = {
        '論文': 'Thesis',
        '国際学会': 'International Conference',
        '国内学会': 'Domestic Conference',
        '受賞': 'Award'
    };

    //const years = [...new Set(data.map(item => item.Year))];
    const years = [...new Set(data.map(item => item.Year))].sort((a, b) => b - a);

    years.forEach((year, index) => {
        const details = document.createElement('details');
        // ✅ ここで fade-in を復活させる
        details.className = 'year-block fade-in'; 
        if (index === 0) details.open = true;

        const summary = document.createElement('summary');
        summary.className = 'year-heading';
        summary.textContent = `${year}年度`;
        details.appendChild(summary);

        const yearData = data.filter(d => d.Year === year);
        const categories = ['論文', '国際学会', '国内学会', '受賞'];

        categories.forEach(cat => {
            const catMembers = yearData.filter(d => d.Category === cat);
            if (catMembers.length === 0) return;

            const catDiv = document.createElement('div');
            catDiv.className = 'achievement-category';
            catDiv.innerHTML = `
                <h3 class="cat-title">${cat}<span style="font-size:0.8rem; font-weight:normal; margin-left:10px; color:#999;">${categoryEn[cat] || ''}</span></h3>
            `;

            const ul = document.createElement('ul');
            ul.className = 'paper-list';
            catMembers.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.Content;
                ul.appendChild(li);
            });

            catDiv.appendChild(ul);
            details.appendChild(catDiv);
        });

        container.appendChild(details);
        // ✅ 追加した直後の要素を監視対象に入れる
        fadeInObserver.observe(details);
    });
}

// メンバーページのレンダリング
function renderMembers(data) {
    const container = document.getElementById('member-app');
    if (!container) return;
    container.innerHTML = '';

    const categories = [...new Set(data.map(item => item.Category))];

    categories.forEach(cat => {
        if (!cat) return;
        const section = document.createElement('div');
        // ✅ ここで fade-in を復活させる
        section.className = cat === 'Alumni' ? 'alumni-section fade-in' : 'member-year-section fade-in';
        
        if (cat === 'Alumni') {
            const alumniTitle = document.createElement('h2');
            alumniTitle.className = 'year-label-lg';
            alumniTitle.textContent = 'OB/OG';
            section.appendChild(alumniTitle);
        } else {
            section.innerHTML = `<h2 class="year-label-lg">${cat}年度</h2>`;
        }

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
        // ✅ 追加した直後の要素を監視対象に入れる
        fadeInObserver.observe(section);
    });
}

// ギャラリーのレンダリング処理
function renderGallery(data, galleryId) {
    const container = document.getElementById(galleryId);
    if (!container) return;

    const list = container.querySelector('.splide__list');
    if (!list) return;

    list.innerHTML = '';

    data.forEach(item => {
        const li = document.createElement('li');
        li.className = 'splide__slide'; // Splide専用クラス
        li.innerHTML = `
            <div class="gallery-img-wrapper" style="width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 8px; background-color: #eee;">
                <img src="${item.Image}"
                     alt="${item.Alt || ''}"
                     style="width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;"
                >
            </div>
        `;
        list.appendChild(li);
    });

    // Splideの初期化
    new Splide(`#${galleryId}`, {
        type   : 'loop',      // 無限ループ
        drag   : 'free',      // 自由なドラッグ
        focus  : 'center',    // 中央フォーカス
        perPage: 4,           // 一度に表示する枚数（PC）
        gap    : 20,          // 画像間の隙間
        arrows : false,       // 矢印非表示
        pagination: false,    // ドット非表示
        autoScroll: {
            speed: 0.5,         // スクロール速度
        },
        breakpoints: {
            768: {
                perPage: 2,   // スマホでは2枚表示
                gap: 10,
            }
        }
    }).mount( window.splide.Extensions ); // Extensionを忘れずにマウント
}