import json
import re
import requests

# Retrieve data from https://www.kaggle.com/datasets/theriley106/hq-trivia-question-database
data = json.load(open('data.json', encoding='utf-8'))

def trim_str(s):
	# Remove links and trailing whitespace
	return re.sub(r"https?://\S+", "", s).strip()

class Question:
	def __init__(self, question, correct_answer, incorrect_answers):
		self.question = trim_str(question)
		self.category = "HQ Trivia"
		self.difficulty = "medium"
		self.type = "multiple"
		self.correct_answer = trim_str(correct_answer)
		self.incorrect_answers = list(map(trim_str, incorrect_answers))

	def to_json(self):
		return json.dumps({
			"question": self.question,
			"category": self.category,
			"difficulty": self.difficulty,
			"type": self.type,
			"correct_answer": self.correct_answer,
			"incorrect_answers": self.incorrect_answers
		})

	def upload(self):
		url = "https://discord-bot.kdamp.workers.dev/api/question"
		headers = {
			"Content-Type": "application/json"
		}
		response = requests.post(url, headers=headers, data=self.to_json())
		print(response.text)

	def __str__(self):
		return f"{self.question}\nCorrect Answer: {self.correct_answer}\nIncorrect Answers: {self.incorrect_answers}"

questions = []

for question in data:
	correct_answer = ""
	incorrect_answers = []
	for answer in question['answers']:
		if answer['correct']:
			correct_answer = answer['text']
		else:
			incorrect_answers.append(answer['text'])

	if correct_answer != "":
		q = Question(question['question'], correct_answer, incorrect_answers)
		questions.append(q)

print(f"Found {len(questions)} questions")

for question in questions:
	question.upload()
