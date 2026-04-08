import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
        await dbConnect();
        const teacher = await User.findById(userId);
        if (!teacher || teacher.role !== 'teacher') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { studentId, text } = await request.json();
        if (!studentId || !text?.trim()) {
            return Response.json({ error: 'Student ID and remark text are required' }, { status: 400 });
        }
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return Response.json({ error: 'Student not found' }, { status: 404 });
        }
        student.remarks.push({ teacherId: teacher._id, teacherName: teacher.name, text: text.trim() });
        await student.save();
        return Response.json({ success: true, remark: student.remarks[student.remarks.length - 1] });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const userId = await getAuthUser(request);
        if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
        await dbConnect();
        const teacher = await User.findById(userId);
        if (!teacher || teacher.role !== 'teacher') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { studentId, remarkId } = await request.json();
        const student = await User.findById(studentId);
        if (!student) return Response.json({ error: 'Student not found' }, { status: 404 });
        student.remarks = student.remarks.filter(
            r => !(r._id.toString() === remarkId && r.teacherId.toString() === userId)
        );
        await student.save();
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
