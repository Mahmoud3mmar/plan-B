import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizResult } from './entities/quiz-result.entity';
import { Student } from '../student/entities/student.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(QuizResult.name) private quizResultModel: Model<QuizResult>,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const createdQuiz = new this.quizModel(createQuizDto);
    return createdQuiz.save();
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizModel.find().populate('curriculumBlock').exec();
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id).populate('curriculumBlock').exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const updatedQuiz = await this.quizModel
      .findByIdAndUpdate(id, updateQuizDto, { new: true })
      .populate('curriculumBlock')
      .exec();
    
    if (!updatedQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return updatedQuiz;
  }

  async remove(id: string): Promise<void> {
    const result = await this.quizModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
  }

  async findByCurriculumBlock(curriculumBlockId: string): Promise<Quiz[]> {
    return this.quizModel
      .find({ curriculumBlock: curriculumBlockId })
      .populate('curriculumBlock')
      .exec();
  }

  async submitQuiz(studentId: string, submitQuizDto: SubmitQuizDto): Promise<QuizResult> {
    const quiz = await this.quizModel.findById(submitQuizDto.quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if student has already taken this quiz
    const existingAttempt = await this.quizResultModel.findOne({
      quiz: submitQuizDto.quizId,
      student: studentId,
    });

    if (existingAttempt) {
      throw new BadRequestException('You have already taken this quiz');
    }

    // Calculate score
    const answers = submitQuizDto.answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      
      return {
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      };
    });

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;

    // Create quiz result
    const quizResult = new this.quizResultModel({
      quiz: quiz._id,
      student: studentId,
      answers,
      score,
      passed,
      completedAt: new Date(),
    });

    return quizResult.save();
  }

  async getStudentQuizResults(studentId: string): Promise<QuizResult[]> {
    return this.quizResultModel
      .find({ student: studentId })
      .populate('quiz')
      .exec();
  }

  async getQuizResult(studentId: string, quizId: string): Promise<QuizResult> {
    const result = await this.quizResultModel
      .findOne({ student: studentId, quiz: quizId })
      .populate('quiz')
      .exec();

    if (!result) {
      throw new NotFoundException('Quiz result not found');
    }

    return result;
  }
}
