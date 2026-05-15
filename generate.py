import uuid
import random

def generate_sql():
    # Matches the database name in your schema.sql
    sql = "USE campusaurus;\n\n"
    
    # --- DATA POOLS FOR VARIETY ---
    first_names = ['Near', 'Ed', 'Renz', 'Chris', 'Sarah', 'Ava', 'Juan', 'Maria', 'Jose', 'Miguel', 'Sofia', 'Luis', 'Carmen', 'Paolo', 'Bea', 'Carlos', 'Diana']
    last_names = ['Aquino', 'Reyes', 'Cruz', 'Santos', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Villanueva', 'Flores', 'Perez']
    depts = ['CCS', 'CEA', 'CHS', 'CTHBM', 'CTDE', 'CAS']
    year_levels = ['1st Year', '2nd Year', '3rd Year', '4th Year']
    genders = ['M', 'F', 'Prefer not to say']
    islands = ['ccs', 'cea', 'chs', 'cthbm', 'ctde', 'cas', 'general', 'org_council', 'sports_club']
    
    nest_topics = ['PythonHelp', 'ArduinoRobotics', 'CiscoNetworking', 'MachineLearning', 'Rizal_History', 'WebDev', 'DataStructures', 'ImageProcessing', 'CalculusTips', 'CampusLife']
    
    post_ideas = [
        ("Help with TB6612FNG Driver", "I am building a line-following robot. Should I use the L298N or the TB6612FNG for better motor control?"),
        ("IR Sensor Array Configuration", "Just a heads up for the robotics project: we are utilizing only 5 arrays on an 8-channel IR sensor. Adjust your PID controllers accordingly!"),
        ("Neural Networks vs Logistic Regression", "For our obesity level classification project, the neural network is outperforming logistic regression. Has anyone else tested this on the UCI dataset?"),
        ("Cisco Packet Tracer - Mac Lab", "Does anyone have the subnet mask requirements for the Midterm Mac laboratory network simulation? I have the routers and WAPs set up."),
        ("CSAM 212 Final Examination", "Are we allowed to bring a cheat sheet for the CSAM 212 finals? I'm struggling to remember all the Bayesian inference formulas."),
        ("Low-Pass Filtering Algorithms", "Implementing kernels for smoothing and edge detection on the dental radiographs. The math is getting complex!"),
        ("Cardivas vs Nevotens Research", "Currently analyzing the clinical trial statistical inference data for hypertension medications. Does anyone have the variance formulas?"),
        ("Tagalog Poetry - 'Pagyao'", "Quick pronunciation guide for the poetry club: 'pagyao' is read as 'pag-ya-o', it does not end in a diphthong!"),
        ("Flask + SQL Routing", "Having trouble doing a SQL JOIN between my Posts and Nests tables. Any backend experts here?"),
        ("Campus Wi-Fi Down", "Is the campus network down in the CCS building again? I can't connect to the repository.")
    ]

    announcement_titles = ['Midterm Schedule Released', 'Campus Hackathon 2026', 'Library Hours Extended', 'System Maintenance', 'Job Fair Next Week', 'Enrollment Deadline']
    
    chat_messages = ["Hey everyone!", "Has anyone finished the IM1 project?", "Wait, what time is the meeting?", "Can someone send the link?", "Good luck on finals!", "I need coffee.", "See you at the Base Camp."]

    comment_texts = ["Great discovery!", "I was wondering the exact same thing.", "Check the documentation on page 42.", "Can you share your source code?", "Thanks for the tip!", "This helped me a lot, thanks!"]

    # 1. Generate 50+ Users
    sql += "-- 50+ USERS\n"
    user_ids = [str(uuid.uuid4()) for _ in range(55)]
    user_emails = []
    
    # Ensure standard users from your schema exist
    sql += f"INSERT IGNORE INTO users (id, username, email, password_hash, age, gender, dept, year_level) VALUES ('11111111-1111-1111-1111-111111111111', 'student1', 'student1@example.com', 'hashed_pw_1', 18, 'M', 'CCS', '1st Year');\n"
    sql += f"INSERT IGNORE INTO users (id, username, email, password_hash, age, gender, dept, year_level) VALUES ('33333333-3333-3333-3333-333333333333', 'admin', 'admin@example.com', 'hashed_pw_3', 30, 'N/A', 'ADMIN', 'N/A');\n"
    user_ids[0] = '11111111-1111-1111-1111-111111111111'
    user_ids[1] = '33333333-3333-3333-3333-333333333333'
    user_emails.append('student1@example.com')
    user_emails.append('admin@example.com')
    user_emails.append('kurtaquino49@gmail.com') # For the admin whitelist

    for i in range(2, 55):
        uid = user_ids[i]
        uname = f"{random.choice(first_names)}{random.randint(10, 999)}"
        email = f"{uname.lower()}@cspc.edu.ph"
        user_emails.append(email)
        dept = random.choice(depts)
        yr = random.choice(year_levels)
        age = random.randint(18, 24)
        gender = random.choice(genders)
        bio = "Exploring the digital campus."
        sql += f"INSERT IGNORE INTO users (id, username, email, password_hash, bio, age, gender, dept, year_level) VALUES ('{uid}', '{uname}', '{email}', 'hashed_pw_123', '{bio}', {age}, '{gender}', '{dept}', '{yr}');\n"

    # 2. Generate 50+ Admins (Privilege Registry)
    sql += "\n-- 50+ ADMINS\n"
    sql += "INSERT IGNORE INTO admins (email) VALUES ('kurtaquino49@gmail.com');\n"
    for i in range(50):
        # Pick random emails from the user pool to be "admins" so the table hits the 50 count
        sql += f"INSERT IGNORE INTO admins (email) VALUES ('{user_emails[i]}');\n"

    # 3. Generate 50+ Nests
    sql += "\n-- 50+ NESTS\n"
    nest_ids = [str(uuid.uuid4()) for _ in range(55)]
    for i, nid in enumerate(nest_ids):
        t_name = random.choice(nest_topics)
        sql += f"INSERT IGNORE INTO nests (id, island_id, name, description, creator_id) VALUES ('{nid}', '{random.choice(islands)}', 'n/{t_name}_{i}', 'Community discussions for {t_name}', '{random.choice(user_ids)}');\n"

    # 4. Generate 50+ Posts
    sql += "\n-- 50+ POSTS\n"
    post_ids = [str(uuid.uuid4()) for _ in range(55)]
    for i in range(55):
        pid = post_ids[i]
        post_data = random.choice(post_ideas)
        title = post_data[0].replace("'", "''") 
        content = post_data[1].replace("'", "''")
        likes = random.randint(0, 45)
        comments = random.randint(1, 5) # To match our comments table
        sql += f"INSERT IGNORE INTO posts (id, category_id, title, content, author_id, likes, comments) VALUES ('{pid}', '{random.choice(nest_ids)}', '{title} {i}', '{content}', '{random.choice(user_ids)}', {likes}, {comments});\n"

    # 5. Generate 50+ Comments
    sql += "\n-- 50+ COMMENTS\n"
    for i in range(55):
        cid = str(uuid.uuid4())
        msg = random.choice(comment_texts)
        sql += f"INSERT IGNORE INTO comments (id, post_id, author_id, content) VALUES ('{cid}', '{random.choice(post_ids)}', '{random.choice(user_ids)}', '{msg}');\n"

    # 6. Generate 50+ Announcements
    sql += "\n-- 50+ ANNOUNCEMENTS\n"
    for i in range(55):
        aid = str(uuid.uuid4())
        title = random.choice(announcement_titles)
        sql += f"INSERT IGNORE INTO announcements (id, title, body, author_id) VALUES ('{aid}', '{title} - Update {i}', 'Please be advised regarding the {title.lower()} happening shortly. Check your CSPC emails for details.', '{random.choice(user_ids)}');\n"

    # 7. Generate 50+ Chat Messages
    sql += "\n-- 50+ CHAT MESSAGES\n"
    for i in range(55):
        cid = str(uuid.uuid4())
        msg = random.choice(chat_messages)
        sql += f"INSERT IGNORE INTO chat_messages (id, user_id, message) VALUES ('{cid}', '{random.choice(user_ids)}', '{msg}');\n"

    with open('initial_data.sql', 'w') as f:
        f.write(sql)
    print("✅ Successfully generated initial_data.sql with 50+ records for all 7 tables!")

if __name__ == "__main__":
    generate_sql()