from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
import csv

# Flask 앱 생성 및 설정 (가장 먼저!)
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],  # React 개발 서버 주소
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Authorization", "Content-Type"]
    }
})

# --- DB 및 JWT Secret Key 설정 ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-very-secret-key-for-jwt'
db = SQLAlchemy(app)

# --- User 모델 ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100))
    department = db.Column(db.String(100))
    year = db.Column(db.Integer)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# --- Course 및 UserTakenCourse 모델 ---
class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50))      # 구분
    code = db.Column(db.String(30))          # 교과목 번호
    name = db.Column(db.String(200))         # 교과목명(한글)
    name_en = db.Column(db.String(200))      # 교과목명(영문)
    credit = db.Column(db.Integer)           # 학점
    semester = db.Column(db.String(20))      # 학기

class UserTakenCourse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    
    user = db.relationship('User', backref=db.backref('taken_courses', lazy=True))
    course = db.relationship('Course', backref=db.backref('takers', lazy=True))

# --- JWT 토큰 검증 데코레이터 ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': '토큰이 존재하지 않습니다.'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['id'])
        except Exception as e:
            return jsonify({'message': '토큰이 유효하지 않습니다.', 'error': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# --- 기존 API 엔드포인트 ---
@app.route('/api/courses/all', methods=['GET'])
def get_all_courses():
    courses = Course.query.all()
    return jsonify([{
        "id": c.id,
        "name": c.name,
        "category": c.category,
        "code": c.code,
        "name_en": c.name_en,
        "credit": c.credit,
        "semester": c.semester
    } for c in courses])

@app.route('/api/user/courses', methods=['GET'])
@token_required
def get_user_courses(current_user):
    taken_courses = UserTakenCourse.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        "id": tc.course.id,
        "name": tc.course.name,
        "category": tc.course.category,
        "code": tc.course.code,
        "name_en": tc.course.name_en,
        "credit": tc.course.credit,
        "semester": tc.course.semester
    } for tc in taken_courses])

@app.route('/api/user/courses', methods=['POST'])
@token_required
def add_user_course(current_user):
    data = request.get_json()
    course_id = data.get('course_id')
    if not course_id:
        return jsonify({"error": "course_id가 필요합니다."}), 400
    if UserTakenCourse.query.filter_by(user_id=current_user.id, course_id=course_id).first():
        return jsonify({"error": "이미 이수한 과목입니다."}), 409
    new_taken_course = UserTakenCourse(user_id=current_user.id, course_id=course_id)
    db.session.add(new_taken_course)
    db.session.commit()
    course = Course.query.get(course_id)
    return jsonify({"message": f"'{course.name}' 과목이 추가되었습니다.", "course": {
        "id": course.id,
        "name": course.name,
        "category": course.category,
        "code": course.code,
        "name_en": course.name_en,
        "credit": course.credit,
        "semester": course.semester
    }}), 201

@app.route('/api/user/courses/<int:course_id>', methods=['DELETE'])
@token_required
def delete_user_course(current_user, course_id):
    taken_course = UserTakenCourse.query.filter_by(user_id=current_user.id, course_id=course_id).first()
    if taken_course:
        db.session.delete(taken_course)
        db.session.commit()
        return jsonify({"message": "이수 과목이 삭제되었습니다."}), 200
    return jsonify({"error": "해당 이수 내역을 찾을 수 없습니다."}), 404

@app.route('/api/recommendations', methods=['GET'])
@token_required
def get_recommendations(current_user):
    # 현재는 빈 목록을 반환합니다.
    # 추후에는 current_user.id를 기반으로 개인화된 추천 로직을 구현합니다.
    print(f"사용자 {current_user.email}를 위한 추천 목록을 생성합니다. (현재는 빈 목록)")
    recommendations = []
    return jsonify(recommendations)

# --- 새로운 API 엔드포인트 추가 ---
@app.route('/api/user/info', methods=['GET'])
@token_required  # 토큰 검증 데코레이터 추가
def get_user_info(current_user):  # current_user 파라미터 추가
    try:
        return jsonify({
            "name": current_user.name,
            "department": current_user.department,
            "year": current_user.year,
            "email": current_user.email
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/api/next-semester-courses', methods=['POST'])
@token_required
def get_next_semester_courses(current_user):
    try:
        data = request.get_json()
        taken_courses = data.get('takenCourses', [])
        user_year = data.get('userYear', 1)
        
        # 사용자가 이미 이수한 과목 코드들
        taken_codes = [course.get('code', '') for course in taken_courses]
        
        # 임시 추천 데이터 (나중에 실제 DB 쿼리로 변경)
        recommendations = {
            'required': [
                {
                    'id': 1,
                    'name': '공학통계(Ⅱ)',
                    'code': 'IE2400211',
                    'credits': 3,
                    'description': '산업공학에서 활용되는 다양한 기법들의 기반이 되는 통계 이론을 학습합니다.',
                    'reason': '전공 필수 과목입니다.'
                },
                {
                    'id': 2,
                    'name': '경영과학(Ⅱ)',
                    'code': 'IE2400217',
                    'credits': 3,
                    'description': '복잡한 의사결정 문제 해결을 위한 수리적 모델링과 최적화 기법을 배웁니다.',
                    'reason': '전공 필수 과목입니다.'
                }
            ],
            'prerequisiteReady': [
                {
                    'id': 3,
                    'name': '제조공학응용',
                    'code': 'IE3600660',
                    'credits': 3,
                    'description': '제조 현장에 적용되는 다양한 공정 기술과 그 활용 방법을 배웁니다.',
                    'reason': '제조공학 과목을 학습했습니다.'
                }
            ],
            'electives': [
                {
                    'id': 4,
                    'name': '산업데이터과학',
                    'code': 'IE3500627',
                    'credits': 3,
                    'description': '산업 전반에서 활용되는 데이터 분석 기법을 학습합니다.',
                    'reason': '2-2에 수강해두면 이후 전공 과목을 보다 쉽게 이해할 수 있습니다.'
                }
            ]
        }
        
        # 이미 이수한 과목들은 추천에서 제외
        for category in recommendations:
            recommendations[category] = [
                course for course in recommendations[category] 
                if course['code'] not in taken_codes
            ]
        
        return jsonify(recommendations), 200
        
    except Exception as e:
        print(f'추천 오류: {e}')
        return jsonify({'error': '추천 시스템 오류'}), 500

# --- 인증 관련 API ---
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "이메일과 비밀번호는 필수입니다."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "이미 존재하는 이메일입니다."}), 409

    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "회원가입이 성공적으로 완료되었습니다."}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        return jsonify({"error": "이메일 또는 비밀번호가 올바르지 않습니다."}), 401

    token = jwt.encode({
        'id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({"message": "로그인이 성공적으로 완료되었습니다.", "token": token}), 200

@app.route('/api/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        "id": current_user.id,
        "email": current_user.email
    })

@app.route('/api/user/update', methods=['PUT'])
@token_required
def update_user(current_user):
    try:
        data = request.get_json()
        
        # 사용자 정보 업데이트
        current_user.name = data.get('name', current_user.name)
        current_user.department = data.get('department', current_user.department)
        current_user.year = data.get('year', current_user.year)
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "사용자 정보가 업데이트되었습니다.",
            "data": {
                "name": current_user.name,
                "department": current_user.department,
                "year": current_user.year,
                "email": current_user.email
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # admin 계정 생성
        if not User.query.filter_by(email='admin').first():
            admin_user = User(email='admin')
            admin_user.set_password('admin')
            db.session.add(admin_user)
            db.session.commit()
            print("디버깅용 admin 계정이 생성되었습니다.")
        
        # 초기 강의 데이터 추가 (CSV에서 읽기)
        if Course.query.count() == 0:
            csv_path = r'C:\Users\user\OneDrive\바탕 화면\Compus Compass\Course_Optimizer\src\2025course_data.csv'
            try:
                with open(csv_path, encoding='utf-8-sig') as f:
                    reader = csv.DictReader(f)
                    courses = []
                    for row in reader:
                        if not row['교과목명(영문명)']:
                            continue
                        course = Course(
                            category=row['구분'].strip(),
                            code=row['교과목번호'].replace(' ', '').strip(),
                            name=row['교과목명(영문명)'].split('(')[0].strip(),
                            name_en=row['교과목명(영문명)'].split('(')[-1].replace(')', '').strip() if '(' in row['교과목명(영문명)'] else '',
                            credit=int(row['학점'].replace(' ', '').strip()),
                            semester=row['학기'].replace(' ', '').strip()
                        )
                        courses.append(course)
                    db.session.bulk_save_objects(courses)
                    db.session.commit()
                    print(f"{len(courses)}개 강의가 추가되었습니다.")
            except FileNotFoundError:
                print("CSV 파일을 찾을 수 없습니다. 강의 데이터는 나중에 추가해주세요.")
            except Exception as e:
                print(f"CSV 파일 읽기 오류: {e}")
    
    app.run(debug=True, port=5001)


# 기존 코드 아래에 이 함수들 추가

def get_smart_recommendations(current_user, user_year=2):
    """규칙 기반 스마트 추천 시스템"""
    
    # 1. 사용자가 이미 이수한 과목들 조회
    taken_course_ids = [tc.course_id for tc in UserTakenCourse.query.filter_by(user_id=current_user.id).all()]
    taken_courses = Course.query.filter(Course.id.in_(taken_course_ids)).all() if taken_course_ids else []
    taken_codes = [course.code for course in taken_courses]
    taken_categories = [course.category for course in taken_courses]
    
    # 2. 아직 이수하지 않은 모든 과목들
    available_courses = Course.query.filter(~Course.id.in_(taken_course_ids)).all() if taken_course_ids else Course.query.all()
    
    recommendations = {
        'required': [],
        'prerequisiteReady': [],
        'electives': []
    }
    
    # 3. 규칙 기반 분류
    for course in available_courses:
        
        # 필수 과목 추천 (전공필수, 교양필수)
        if any(keyword in course.category for keyword in ['필수', '전공', '기초']):
            recommendations['required'].append({
                'id': course.id,
                'name': course.name,
                'code': course.code,
                'credits': course.credit,
                'description': f"{course.category} 과목입니다.",
                'reason': f"{course.category} - 졸업요건 필수과목"
            })
            
        # 선수과목 관련 추천 (간단한 규칙)
        elif is_prerequisite_ready(course, taken_codes, user_year):
            recommendations['prerequisiteReady'].append({
                'id': course.id,
                'name': course.name,
                'code': course.code,
                'credits': course.credit,
                'description': f"{course.category} 과목입니다.",
                'reason': "선수과목 조건을 만족합니다"
            })
            
        # 일반 선택과목
        else:
            recommendations['electives'].append({
                'id': course.id,
                'name': course.name,
                'code': course.code,
                'credits': course.credit,
                'description': f"{course.category} 과목입니다.",
                'reason': get_recommendation_reason(course, taken_categories, user_year)
            })
    
    # 4. 각 카테고리별로 상위 5개씩만 추천
    for category in recommendations:
        recommendations[category] = recommendations[category][:5]
    
    return recommendations

def is_prerequisite_ready(course, taken_codes, user_year):
    """선수과목 조건 체크 (간단한 규칙)"""
    course_code = course.code
    
    # 코드 기반 간단한 선수과목 규칙
    if any(code.startswith('CS2') for code in taken_codes) and course_code.startswith('CS3'):
        return True
    if any(code.startswith('MATH1') for code in taken_codes) and course_code.startswith('MATH2'):
        return True
    if user_year >= 2 and course_code.startswith('CS2'):
        return True
    if user_year >= 3 and course_code.startswith('CS3'):
        return True
        
    return False

def get_recommendation_reason(course, taken_categories, user_year):
    """추천 이유 생성"""
    reasons = []
    
    # 학년별 추천 이유
    if user_year == 1:
        reasons.append("1학년 추천 과목")
    elif user_year == 2:
        reasons.append("2학년 전공 기초")
    elif user_year == 3:
        reasons.append("3학년 전공 심화")
    elif user_year >= 4:
        reasons.append("취업/졸업 준비")
    
    # 카테고리 기반 추천
    if course.category not in taken_categories:
        reasons.append(f"새로운 {course.category} 분야")
    
    # 학점 기반
    if course.credit >= 3:
        reasons.append("고학점 과목")
    
    return " · ".join(reasons) if reasons else "일반 선택과목"

# 기존 API 엔드포인트 수정
@app.route('/api/next-semester-courses', methods=['POST'])
@token_required
def get_next_semester_courses(current_user):
    try:
        data = request.get_json()
        user_year = data.get('userYear', 2)
        
        # 실제 DB 기반 추천 시스템 호출
        recommendations = get_smart_recommendations(current_user, user_year)
        
        return jsonify(recommendations), 200
        
    except Exception as e:
        print(f'추천 오류: {e}')
        # 에러 시 기본 추천 반환
        fallback_recommendations = {
            'required': [], 
            'prerequisiteReady': [], 
            'electives': []
        }
        return jsonify(fallback_recommendations), 200
