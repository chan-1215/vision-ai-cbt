# 학습 AI — MySQL Workbench 한글 SQL 도우미

**한글로 요청하고, 생성된 SQL을 읽고 고쳐 보면서 MySQL을 연습하는 로컬 교육 보조 도구입니다.**

MySQL Workbench SQL 편집기에서 `#한글 요청`을 입력하고 Enter를 누르면 아래에 SQL을 삽입합니다. Ollama가 PC에서 `qwen2.5-coder:3b` 모델을 실행하며, SQL 실행은 사용자가 검토 후 직접 합니다.

[설치·사용법](docs/USAGE.md) · [구조](docs/ARCHITECTURE.md) · [검증 범위](docs/VALIDATION.md) · [데이터와 기록](docs/PRIVACY.md) · [외부 구성 요소](THIRD_PARTY.md) · [MySQL 작업실로](../README.md)

## 학습에 사용하는 방법

1. [웹 SQL 작업실](https://vision-ai-cbt.pages.dev/sql/)에서 문제와 개념을 확인하고 먼저 SQL을 작성합니다.
2. 막히는 조건을 한글로 적어 Workbench에서 예시 SQL을 생성합니다.
3. 본인 풀이와 비교해 테이블·열·조건·정렬·집계가 맞는지 설명해 봅니다.
4. 검토한 SQL만 직접 실행하고, 요청을 바꾸면서 결과가 달라지는 이유를 확인합니다.

이 도구는 정답 채점이나 학습 성취도 판정을 수행하지 않습니다. `course.json`의 52개 예제를 참고하며, 예제 제목·문제와 정확히 일치하는 요청은 조건에 따라 저장된 답안을 반환합니다. 그 외에는 예제·스키마·앞선 SQL을 모델 입력에 포함합니다. **모델을 새로 훈련하거나 미세 조정한 프로젝트는 아닙니다.**

## 입력과 출력 예시

입력 후 Enter:

```sql
#가격이 10000원 이상인 상품의 이름과 가격을 비싼 순서로 보여줘
```

삽입 예시:

```sql
#가격이 10000원 이상인 상품의 이름과 가격을 비싼 순서로 보여줘
SELECT name, price
FROM products
WHERE price >= 10000
ORDER BY price DESC;
```

위 예시는 연습용 `products` 테이블 기준입니다. 생성 결과의 줄바꿈과 별칭은 달라질 수 있습니다. 본인 DB에서는 먼저 **Tools → SQL AI → 현재 DB 테이블 구조 읽기**를 실행하세요.

## 빠른 시작 — Windows

1. 저장소를 내려받아 압축을 해제합니다. 이 폴더 전체를 유지하세요.
2. MySQL 서버, Python 3를 지원하는 MySQL Workbench 8.0, [Ollama for Windows](https://ollama.com/download/windows)를 준비합니다.
3. 이 폴더의 [`1_설치.cmd`](1_설치.cmd)를 실행합니다. 처음에는 모델을 내려받으므로 인터넷과 저장 공간이 필요합니다.
4. 작성 중인 SQL을 저장하고 **Workbench 전체를 종료한 뒤 다시 실행**합니다.
5. DB 연결과 SQL 탭을 열고 **Tools → SQL AI → 이 탭에서 자동 생성 켜기 / 끄기**를 선택합니다.
6. `#한글 요청`을 한 줄로 적고 Enter를 누릅니다. 생성 중에는 편집하거나 커서를 옮기지 않습니다.

다음 PC 재부팅 후에는 [`AI_시작.cmd`](AI_시작.cmd)를 실행합니다. 새 SQL 탭 또는 Workbench 재시작 후 자동 생성을 다시 켭니다. 실행용 별도 Python 설치와 API 키는 필요하지 않습니다. 테스트를 실행하는 개발자만 Python 3가 필요합니다.

**GitHub에는 Ollama 실행 파일과 약 1.9GB 모델 가중치를 포함하지 않습니다.** 시작 스크립트는 `runtime/ollama.exe`가 있으면 사용하고, 없으면 설치된 Ollama를 찾습니다. 전용 서버는 `127.0.0.1:11435`, 모델 저장 위치는 이 폴더의 `models/`입니다. 모델 준비 후에는 로컬 생성에 인터넷이 필요하지 않습니다.

## 구성

| 파일 | 역할 |
| --- | --- |
| [mysql_korean_ai_grt.py](mysql_korean_ai_grt.py) | Workbench 플러그인 1.0.2: 메뉴·타이머·편집기 삽입·스키마 읽기 |
| [local_ai_core.py](local_ai_core.py) | 요청 판별·UTF-8 위치 변환·예제 선택·로컬 모델 호출 |
| [course.json](course.json) | SQL 작업실에서 가져온 연습 스키마와 52개 문제·답안 |
| [1_설치.cmd](1_설치.cmd) / [install-plugin.ps1](install-plugin.ps1) | 사용자 플러그인 설치 |
| [AI_시작.cmd](AI_시작.cmd) / [start-ai.ps1](start-ai.ps1) | 전용 Ollama 서버와 모델 준비 |
| [플러그인_설치.cmd](플러그인_설치.cmd) | 폴더를 이동했을 때 플러그인 경로 재설정 |
| [시작_예제.sql](시작_예제.sql) / [예제_매장.sql](예제_매장.sql) | 요청 예시·연습 DB 구성 SQL |
| [test_local_ai.py](test_local_ai.py) | 모델·DB 없이 실행하는 단위 및 모의 편집기 테스트 |
| [check_model.py](check_model.py) | 실제 모델의 SELECT 4개를 임시 SQLite 데이터와 비교 |
| [docs/](docs/) | 사용·설계·검증·기록 안내 |
| [licenses/](licenses/) | 외부 실행기·모델의 원문 라이선스 |

## 검증과 제약

2026-11-11 공개 준비 과정에서 Python 테스트 15개와 실제 모델 생성·SQLite 비교 4개를 재실행해 모두 통과했습니다. 이전 실제 Workbench 검사에서는 명령 로딩, 타이머, SQL 삽입, 편집 시 삽입 취소, DB 메타데이터 조회를 확인했습니다. Tools 메뉴 누락을 수정한 뒤 실제 레지스트리에서 메뉴 그룹과 세 명령의 연결도 확인했습니다.

실제 메뉴 클릭·키보드 Enter 입력·완전 재시작 후의 화면 표시까지 자동 검증한 것은 아닙니다. 모델 결과의 정확도는 전체 문제에 대해 측정하지 않았으며, SQL 형식 검사는 실행 안전성을 보증하지 않습니다. [검증 기록과 재현 방법](docs/VALIDATION.md)을 확인하세요.

이 폴더는 Windows Workbench용 도구입니다. 웹 SQL 작업실의 브라우저 탭에 AI를 연결하는 기능은 포함하지 않습니다. 모델·실행기는 각 라이선스를 따르며, 프로젝트 코드에는 저장소의 기존 방침과 동일하게 별도의 오픈소스 라이선스를 부여하지 않았습니다. [외부 구성 요소](THIRD_PARTY.md)
