# MySQL SQL 작업실

DB 생성부터 조회·수정·집계·삭제까지 이어지는 52단계 SQL 실습과 자유모드입니다.

**[작업실 열기](https://vision-ai-cbt.pages.dev/sql/)** · [프로젝트 홈](../README.md)

### Workbench용 학습 AI

[**학습 AI 폴더 열기 →**](학습%20AI/README.md)

한글 요청을 MySQL SQL로 바꿔 주는 Windows Workbench용 로컬 교육 보조 도구입니다. Ollama와 `qwen2.5-coder:3b`를 사용하고, SQL을 자동 실행하지 않습니다. 설치·사용법, 소스, 52개 참고 예제, 테스트와 검증 한계를 정리했습니다. 브라우저 작업실과 별도로 Workbench에서 실행하며 모델 가중치는 저장소에 포함하지 않습니다.

### 웹 SQL 작업실 소스

| 수정할 내용 | 파일 |
| --- | --- |
| 단계별 문제·정답·개념 정리 | [src/content.js](src/content.js) |
| SQL 실행·채점 기본 처리 | [src/engine.js](src/engine.js) |
| MySQL 문법·동작 호환 처리 | [src/mysql-compat.js](src/mysql-compat.js) |
| 백그라운드 SQL 실행 | [src/worker.js](src/worker.js) |
| 문제·자유모드·백업 화면 동작 | [src/app.js](src/app.js) |
| 화면 구성과 스타일 | [템플릿](src/index.template.html) · [CSS](src/style.css) |
| MySQL 비교 검증 보고서 | [src/mysql-compat-report.json](src/mysql-compat-report.json) |
| 기능 검사 | [tests/](tests/) |
| 최초 단일 HTML 원본 | [standalone/](standalone/) |
| 사이트용 빌드 결과 | [../common/public/sql/index.html](../common/public/sql/index.html) |

저장소 루트에서 `npm ci`, `npm run build`, `npm test`, `npm run serve` 순서로 실행합니다. 실제 MySQL 서버 없이 오프라인으로 사용할 수 있는 호환 구현입니다. MySQL 전체 기능을 재현하지 않으며, 엔진·문제 변경 시 보고서 재검증이 필요합니다. [검증 범위](../common/docs/VALIDATION.md) · [개발 안내](../common/docs/DEVELOPMENT.md)
