import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Student } from './entities/student.entity';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Course } from '../course/entities/course.entity';
import { Events } from '../events/entities/event.entity';
import { SubTrainingEntity } from 'src/subtraining/entities/subtraining.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(SubTrainingEntity.name) private subTrainingModel: Model<SubTrainingEntity>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(Events.name) private readonly eventModel: Model<Events>
  ) {}

  async enrollInCourse(studentId: string, courseId: string): Promise<Student> {
    const studentObjectId = new Types.ObjectId(studentId);
    const courseObjectId = new Types.ObjectId(courseId);

    try {
      // Check if student exists
      const student = await this.studentModel.findById(studentId).exec();
      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }

      const course = await this.courseModel
        .findById(courseId).exec();
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }
      // async findOne(id: string): Promise<Course> {
      //   const course = await this.courseModel
      //     .findById(id)
      //     .populate('instructor')
      //     .populate('faqs')
      //     .populate('reviews')
      //     .exec();
      //   if (!course) {
      //     throw new NotFoundException(`Course with ID ${id} not found`);
      //   }
      //   return course;
      // }

      // Add course to student's enrolled courses
      if (student.coursesEnrolled.includes(courseObjectId)) {
        throw new ConflictException(
          'Student is already enrolled in this course',
        );
      }

      student.coursesEnrolled.push(courseObjectId);
      await student.save();

      // Increase the studentsEnrolled count in the course
      course.studentsEnrolled += 1;
      await course.save();

      return student;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to enroll in course: ' + error.message,
      );
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async enrollInEvent(studentId: string, eventId: string): Promise<Events> {
    try {
      // Find the event
      const event = await this.eventModel.findById(eventId).exec();
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      // Check if student is already enrolled
      if (event.enrolledStudents.includes(studentId)) {
        throw new Error(`Student with ID ${studentId} is already enrolled in this event`);
      }

      // Enroll the student
      event.enrolledStudents.push(studentId);
      await event.save();

      return event;
    } catch (error) {
      console.error('Error enrolling in event:', error.message || error);
      throw new InternalServerErrorException('Failed to enroll in event');
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Student[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.studentModel.find().skip(skip).limit(limit).exec(),
      this.studentModel.countDocuments().exec(),
    ]);
    return { data, total };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async updateStudent(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    Object.assign(student, updateStudentDto);
    return await student.save();
  }

  async uploadProfileImage(
    id: string,
    image: Express.Multer.File,
  ): Promise<Student> {
    try {
      const student = await this.studentModel.findById(id).exec();
      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found.`);
      }

      const folderName = 'profileImages';
      const uploadResult = await this.cloudinaryService.uploadImage(
        image,
        folderName,
      );

      if (!uploadResult || !uploadResult.url) {
        throw new InternalServerErrorException(
          'Failed to upload image to Cloudinary.',
        );
      }

      student.profileImage = uploadResult.url;
      return await student.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message.includes('Cloudinary')) {
        throw new InternalServerErrorException(
          'Failed to upload image to Cloudinary.',
        );
      }
      console.error('Error in uploadProfileImage service:', error);
      throw new InternalServerErrorException(
        'Failed to upload image. Please try again later.',
      );
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.studentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }

  async enrollInSubTraining(studentId: string, subTrainingId: string): Promise<Student> {
    const studentObjectId = new Types.ObjectId(studentId);
    const subTrainingObjectId = new Types.ObjectId(subTrainingId);

    try {
      // Check if student exists
      const student = await this.studentModel.findById(studentId).exec();
      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }

      // Check if sub-training exists
      const subTraining = await this.subTrainingModel.findById(subTrainingId).exec();
      if (!subTraining) {
        throw new NotFoundException(`Sub-training with ID ${subTrainingId} not found`);
      }

      // Check if student is already enrolled
      if (student.subTrainingsEnrolled.includes(subTrainingObjectId)) {
        throw new ConflictException('Student is already enrolled in this sub-training');
      }

      // Add sub-training to student's enrolled sub-trainings
      student.subTrainingsEnrolled.push(subTrainingObjectId);
      await student.save();

      // Increase the number of students enrolled in the sub-training
      subTraining.numberOfStudentsEnrolled += 1;
      await subTraining.save();

      return student;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to enroll in sub-training: ' + error.message);
    }
  }

  async getEnrolledCourses(studentId: string): Promise<any> {
    const student = await this.studentModel
        .findById(studentId)
        .populate({
            path: 'coursesEnrolled',
            model: Course.name,
        })
        .exec();

    if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return student.coursesEnrolled;
  }
  
}
