# 개발 및 배포

## 수정할 위치

- 화면 구성: `src/bigdata/index.template.html`, `src/sql/index.template.html`
- 스타일: 각 폴더의 `style.css`
- 상호작용: 각 폴더의 `app.js`
- 빅데이터: `data.js`(CSV와 Python 보조 코드), `code-questions.js`, `choice-questions.js`
- SQL: `content.js`(문제·개념), `engine.js`, `mysql-compat.js`, `worker.js`
- 과목 선택 홈: `public/index.html`

`npm ci` → `npm run build` → `npm test` 순서로 확인합니다. 빌드 결과는 `public/`에 생성됩니다. 런타임 외부 라이브러리를 SQL HTML 안에 포함하므로 파일이 비교적 큽니다. Worker bundle은 중간 생성물이므로 Git에 넣지 않습니다.

SQL의 엔진·호환 계층·문제를 변경하면 기존 MySQL 비교 보고서의 소스 해시가 달라져 빌드가 중단됩니다. 이는 과거의 검증 결과를 변경된 코드에 그대로 표시하지 않기 위한 검사입니다. 변경 후 실제 MySQL과 재검증한 보고서가 필요하며, 단순히 해시나 통과 수치를 바꾸어 검사를 우회해서는 안 됩니다. 현재 저장소의 `npm test`는 MySQL 서버 없이 실행 가능한 회귀 검사이며 실제 서버 비교 검사를 대신하지 않습니다.

Windows PowerShell에서 `npm.ps1` 실행 정책 오류가 나면 보안 정책을 변경하지 말고 `npm.cmd ci`, `npm.cmd run build`, `npm.cmd test`, `npm.cmd run serve`로 실행합니다.

## Cloudflare Pages

현재 서비스: https://vision-ai-cbt.pages.dev/

기존 서비스의 배포 설정은 이 저장소 업로드 작업에서 변경하지 않았습니다. Git 연동 방식으로 연결할 경우 다음 값을 사용할 수 있습니다.

| 항목 | 값 |
| --- | --- |
| 프레임워크 | None |
| 빌드 명령 | `npm ci && npm run build` |
| 출력 폴더 | `public` |
| Node.js | 22 이상 |

직접 업로드 방식에서는 **`public/` 안의 내용**을 배포합니다. 저장소 전체나 `standalone/`을 배포 폴더로 지정하지 않습니다. 서버 함수·DB·환경 변수는 사용하지 않습니다.

## 학습 기록

학습 기록은 HTML에 포함되지 않고 브라우저 localStorage에 저장됩니다. 다른 기기·브라우저·도메인으로 옮기기 전 각 공부방에서 내보내기 또는 전체 백업을 실행하세요. 백업 파일에는 사용자의 작성 코드와 진도가 들어갈 수 있으므로 Git에 올리지 않습니다.

`standalone/`의 HTML은 원래 파일을 그대로 보관합니다. 빌드 시 자동 갱신하지 않습니다. `file://`에서 연 파일과 웹사이트는 서로 다른 저장 공간을 사용합니다.
