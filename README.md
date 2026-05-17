# 🛒 SDGs 마켓

SDGs(지속가능발전목표) 17개 목표를 학습하고, 나만의 실천 계획을 작성하는 교육용 웹 애플리케이션입니다.

## 주요 기능

- **SDGs 목표 탐색** : 17가지 SDGs 목표 카드 탐색 및 세부 내용 확인
- **장바구니** : 관심 있는 목표를 선택해 장바구니에 담기
- **실천 계획 작성** : 글 또는 그림(캔버스)으로 나만의 실천 계획 작성
- **실천 영수증** : 완성된 계획을 JPG 저장 또는 클립보드 복사
- **다국어 지원** : 한국어 · English · 日本語 · Bahasa Indonesia
- **SDGs 사전** : 17개 목표 아코디언 형식 상세 보기

## 기술 스택

- HTML / CSS / Vanilla JavaScript
- [html2canvas](https://html2canvas.hertzen.com/) – 영수증 이미지 생성
- [Pretendard](https://github.com/orioncactus/pretendard) / Google Fonts – 폰트
- Material Icons Round – 아이콘

## 사용 방법

별도의 빌드 과정 없이 `index.html`을 브라우저에서 열면 바로 실행됩니다.

```bash
# 로컬 서버 예시 (Python)
python -m http.server 8000
```

## 파일 구조

```
sdgsmarket2/
├── index.html
├── favicon.svg
├── css/
│   └── styles.css
└── js/
    ├── data.js      # SDGs 목표 데이터
    ├── i18n.js      # 다국어 처리
    ├── cart.js      # 장바구니 로직
    ├── carousel.js  # 배너 슬라이드
    ├── canvas.js    # 그림 그리기
    ├── modals.js    # 모달 제어
    ├── render.js    # UI 렌더링
    ├── receipt.js   # 영수증 생성
    └── main.js      # 앱 진입점
```

## 개발자

**교육뮤지컬 꿈꾸는 치수쌤**

- 문의 : [litt.ly/chichiboo](https://litt.ly/chichiboo)

---

> 이 웹페이지는 SDGs 교육을 위한 학습용 사이트로, 실제 결제나 상품 배송은 이루어지지 않습니다.
