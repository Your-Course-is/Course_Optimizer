from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # 모든 출처에서의 요청을 허용 (개발용)

# 산업공학과 교육과정 데이터 (DB 대신 임시 데이터 사용)
industrial_engineering_courses = [
    {
        "id": 1,
        "name": "공학수학",
        "professor": "이수진",
        "category": "전공기초",
        "grade": 1,
        "required_prerequisites": [],
        "recommended_prerequisites": [],
        "recommended_certifications": ["정보처리기사 (필기 일부 도움)"]
    },
    {
        "id": 2,
        "name": "생산관리",
        "professor": "박현우",
        "category": "전공필수",
        "grade": 2,
        "required_prerequisites": ["공학수학"],
        "recommended_prerequisites": ["통계학개론"],
        "recommended_certifications": ["품질경영기사"]
    },
    {
        "id": 3,
        "name": "데이터 분석 및 시각화",
        "professor": "김민준",
        "category": "전공선택",
        "grade": 3,
        "required_prerequisites": ["통계학개론"],
        "recommended_prerequisites": ["Python 프로그래밍"],
        "recommended_certifications": ["ADsP", "SQLD"]
    }
]

@app.route('/api/courses', methods=['GET'])
def get_courses():
    return jsonify(industrial_engineering_courses)

if __name__ == '__main__':
    app.run(debug=True, port=5001) # port 5001에서 서버 실행