import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/database';
import Student from '@/models/student';
import Scholarship from '@/models/scholarship';

export async function POST(request: Request) {
    console.log(request);
    try {
        const scholarData = await request.json();

        await connectDatabase();

        // Create a new student record first
        const newStudent = new Student({
            name: scholarData.name,
            email: scholarData.email,
            gender: scholarData.gender,
            password: "1234567890",
            school: scholarData.school,
            program: scholarData.program,
            year_level: scholarData.year_level,
            status: scholarData.status,
            student_id: scholarData.student_id,
            university: scholarData.university,
        });

        const savedStudent = await newStudent.save();

        // Create scholarship record linked to the student
        const newScholarship = new Scholarship({
            email: scholarData.email,
            gender: scholarData.gender,
            attachment: scholarData.attachment,
            scholarship_type: scholarData.scholarship_type,
            gpa_requirement: scholarData.gpa_requirement,
            benefactor: scholarData.benefactor,
            academic_year: scholarData.academic_year,
            contract_expiration: scholarData.contract_expiration,
            is_revoked: scholarData.is_revoked,

            date_verified: new Date(),
            name: savedStudent.name,
            student_id: savedStudent.student_id,
            university: savedStudent.university,
            program: savedStudent.program,
            year_level: savedStudent.year_level,
            scholarship_id: savedStudent._id,
        });
        await newScholarship.save();

        return NextResponse.json({
            message: 'Scholar added successfully',
            student: savedStudent,
            scholarship: newScholarship
        }, { status: 201 });
    } catch (error) {
        console.error('Error adding new scholar:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}