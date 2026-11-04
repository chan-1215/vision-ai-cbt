# 빅데이터 공부방

5–8장 데이터 분석·가공·정제·시각화를 연습하는 336문제의 학습 도구입니다.

**[공부방 열기](https://vision-ai-cbt.pages.dev/bigdata/)** · [프로젝트 홈](../README.md)

| 수정할 내용 | 파일 |
| --- | --- |
| 코드 작성 문제 | [src/code-questions.js](src/code-questions.js) |
| 객관식·O/X 문제 | [src/choice-questions.js](src/choice-questions.js) |
| 실습 데이터·Python 채점 보조 코드 | [src/data.js](src/data.js) |
| 문제 선택·실행·채점 화면 동작 | [src/app.js](src/app.js) |
| 화면 구성 | [src/index.template.html](src/index.template.html) |
| 테마와 스타일 | [src/style.css](src/style.css) |
| 기능 검사 | [tests/](tests/) |
| 최초 단일 HTML 원본 | [standalone/](standalone/) |
| 사이트용 빌드 결과 | [../public/bigdata/index.html](../public/bigdata/index.html) |

저장소 루트에서 `npm ci`, `npm run build`, `npm test`, `npm run serve` 순서로 실행합니다. Python 코드 실행에는 Pyodide와 패키지를 불러올 인터넷 연결이 필요합니다. 검사 범위는 [검증 안내](../docs/VALIDATION.md)를 참고하세요.
