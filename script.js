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