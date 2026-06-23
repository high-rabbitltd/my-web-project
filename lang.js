const translations = {
    ko: {
        "nav_home": "홈",
        "nav_services": "주요 사업",
        "nav_about": "회사 소개",
        "nav_contact": "오시는 길",
        "nav_issue": "이슈와 상식",
        "nav_algo": "알고리듬",
        "hero_title": "무한한 가능성을<br>연결합니다",
        "hero_desc": "IT 기술부터 공간 디자인, 미디어 콘텐츠까지.<br>유한회사 하이래빗이 당신의 비즈니스에 새로운 가치를 더합니다.",
        "hero_cta": "우리의 사업 보기",
        "services_title": "우리의 전문 분야",
        "badge_game": "신작 게임 출시! 🚀",
        "svc_software_title": "💻 소프트웨어 개발",
        "svc_software_desc": "비즈니스 효율을 극대화하는 맞춤형 웹/앱 솔루션과 혁신적인 프로그램을 개발합니다. <strong>(신작 모바일 게임 '뽕뽕비행기: 갤럭시 디펜더' 출시 완료!)</strong>",
        "svc_interior_title": "🎨 인테리어 디자인",
        "svc_interior_desc": "트렌디한 감각과 실용성을 바탕으로 영감을 주는 최적의 실내 공간을 디자인하고 시공합니다.",
        "svc_media_title": "🎬 미디어 콘텐츠",
        "svc_media_desc": "독창적인 기획력으로 감각적인 영상 및 미디어 콘텐츠를 창작하여 브랜드의 가치를 높입니다.",
        "svc_ecommerce_title": "🛒 E-커머스 & 컨설팅",
        "svc_ecommerce_desc": "전문적인 이커머스 운영과 경영 및 광고 설계 컨설팅을 통해 지속 가능한 성장을 돕습니다.",
        "about_subtitle": "ABOUT HIGH RABBIT",
        "about_title": "끊임없이 변화하며<br>새로운 가치를 창출합니다",
        "about_desc": "우리는 각 분야의 경계를 허물고 연결하여, 고객의 비즈니스에 전례 없는 가치와 시너지를 제공하는 것을 사명으로 삼고 있습니다.",
        "about_cta": "공식 캐릭터 보기",
        "stat_founded": "설립",
        "stat_services": "핵심 사업",
        "stat_possibilities": "가능성",
        "footer_company": "<strong>유한회사 하이래빗</strong> | 대표: 김효이",
        "footer_bizinfo": "설립일: 2026년 04월 10일 | 사업자등록번호: 170-81-04056",
        "copy_label_url": "홈페이지 주소 복사",
        "btn_copy": "주소 복사",
        "copy_label_share": "하이래빗 채널 및 공유",
        "share_issue": "이슈와 상식 유튜브",
        "share_algo": "알고리듬 유튜브",
        "share_smart": "스마트 공유"
    },
    en: {
        "nav_home": "Home",
        "nav_services": "Services",
        "nav_about": "About Us",
        "nav_contact": "Location",
        "nav_issue": "Issues & Sense",
        "nav_algo": "Algorhythm",
        "hero_title": "Connecting<br>Infinite Possibilities",
        "hero_desc": "From IT technology to spatial design and media content.<br>High Rabbit adds new value to your business.",
        "hero_cta": "View Our Services",
        "services_title": "Our Expertise",
        "badge_game": "New Game Released! 🚀",
        "svc_software_title": "💻 Software Development",
        "svc_software_desc": "We develop custom web/app solutions and innovative programs to maximize business efficiency. <strong>(New mobile game 'BongBong Airplane' released!)</strong>",
        "svc_interior_title": "🎨 Interior Design",
        "svc_interior_desc": "We design and construct optimal indoor spaces that inspire, based on trendy sense and practicality.",
        "svc_media_title": "🎬 Media Content",
        "svc_media_desc": "We increase brand value by creating sensuous video and media content with original planning.",
        "svc_ecommerce_title": "🛒 E-Commerce & Consulting",
        "svc_ecommerce_desc": "We help sustainable growth through professional e-commerce operations, management, and advertising design consulting.",
        "about_subtitle": "ABOUT HIGH RABBIT",
        "about_title": "Constantly evolving<br>to create new value",
        "about_desc": "Our mission is to break down boundaries and connect different fields to provide unprecedented value and synergy to our clients' businesses.",
        "about_cta": "View Official Character",
        "stat_founded": "Founded",
        "stat_services": "Core Services",
        "stat_possibilities": "Possibilities",
        "footer_company": "<strong>High Rabbit Ltd.</strong> | CEO: Hyo-i Kim",
        "footer_bizinfo": "Established: Apr 10, 2026 | Business Registration No: 170-81-04056",
        "copy_label_url": "Copy Website Address",
        "btn_copy": "Copy Address",
        "copy_label_share": "High Rabbit Channels & Share",
        "share_issue": "Issues & Sense YouTube",
        "share_algo": "Algorhythm YouTube",
        "share_smart": "Smart Share"
    }
};

function changeLang(lang) {
    localStorage.setItem('hr_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Toggle button active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    document.documentElement.lang = lang;
}

// Initialize Language on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('hr_lang') || 'ko';
    changeLang(savedLang);
});
