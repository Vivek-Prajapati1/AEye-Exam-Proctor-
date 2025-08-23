// import * as React from 'react';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
// import Typography from '@mui/material/Typography';
// import { IconButton, Stack, Box } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import DeleteIcon from '../../teacher/components/DeleteIcon';
// import EditIcon from '@mui/icons-material/Edit';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';

// const imgUrl =
//   'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGNvbXB1dGVyJTIwc2NpZW5jZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80';

// export default function ExamCard({ exam }) {
//   const { examName, duration, totalQuestions, liveDate, deadDate } = exam;
//   const { userInfo } = useSelector((state) => state.auth);
//   const isTeacher = userInfo?.role === 'teacher';

//   const navigate = useNavigate();
//   const isExamActive = true;

//   // Determine which ID to use for navigation/editing
//   const idForEdit = exam.examId || exam._id; // Use examId (UUID) if available, otherwise use _id

//   const handleCardContentClick = () => {
//     if (isTeacher) {
//       toast.error('You are a teacher, you cannot take this exam');
//     }
//     if (isExamActive && !isTeacher) {
//       navigate(`/exam/${idForEdit}`);
//     }
//   };

//   const handleEditClick = (event) => {
//     event.stopPropagation(); // Prevent CardContent click from bubbling up
//     navigate(`/teacher/exam/edit/${idForEdit}`); // Navigate using the determined ID
//   };

//   return (
//     <Card>
//       <Box onClick={handleCardContentClick} sx={{ cursor: 'pointer' }}>
//         <CardMedia component="img" height="140" image={imgUrl} alt="Exam" />
//         <CardContent>
//           <Stack direction="row" justifyContent="space-between" alignItems="center">
//             <Typography gutterBottom variant="h5" component="div">
//               {examName}
//             </Typography>
//             {/* Actions for teachers (Edit and Delete) */}
//             {isTeacher && (
//               <Stack direction="row" spacing={1}>
//                 <IconButton aria-label="edit" onClick={handleEditClick}>
//                   <EditIcon />
//                 </IconButton>
//                 <IconButton aria-label="delete">
//                   <DeleteIcon examId={idForEdit} /> {/* Use idForEdit for DeleteIcon as well */}
//                 </IconButton>
//               </Stack>
//             )}
//           </Stack>

//           <Typography variant="body2" color="text.secondary">
//             MCQ
//           </Typography>

//           <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1}>
//             <Typography variant="h6">{totalQuestions} ques</Typography>
//             <Typography color="textSecondary">{duration}</Typography>
//           </Stack>
//         </CardContent>
//       </Box>
//     </Card>
//   );
// }











import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { IconButton, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '../../teacher/components/DeleteIcon';
import EditIcon from '@mui/icons-material/Edit';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const imgUrl =
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGNvbXB1dGVyJTIwc2NpZW5jZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80';

export default function ExamCard({ exam }) {
  const { examName, duration, totalQuestions, liveDate, deadDate } = exam;
  const { userInfo } = useSelector((state) => state.auth);

  const isTeacher = userInfo?.role === 'teacher';
  const navigate = useNavigate();
  const now = new Date();
  const startsAt = liveDate ? new Date(liveDate) : null;
  const endsAt = deadDate ? new Date(deadDate) : null;
  const isUpcoming = startsAt && now < startsAt;
  const isExpired = endsAt && now > endsAt;
  const isExamActive = !isUpcoming && !isExpired;

  // Use examId (UUID) if available, otherwise MongoDB _id
  const idForEdit = exam.examId || exam._id;

  // ✅ Only allow the creator teacher to edit/delete
  const isCreator = exam.createdBy === userInfo?._id;

  const handleCardContentClick = () => {
    if (isTeacher && !isCreator) {
      toast.error('You are a teacher, you cannot take this exam');
      return;
    }
    if (!isTeacher && isUpcoming) {
      toast.warn('This exam has not started yet.');
      return;
    }
    if (!isTeacher && isExpired) {
      toast.error('This exam has expired.');
      return;
    }
    if (isExamActive && !isTeacher) {
      navigate(`/exam/${idForEdit}`);
    }
  };

  const handleEditClick = (event) => {
    event.stopPropagation(); // Prevent CardContent click bubbling
    navigate(`/teacher/exam/edit/${idForEdit}`);
  };

  return (
    <Card>
      <Box onClick={handleCardContentClick} sx={{ cursor: 'pointer' }}>
        <CardMedia component="img" height="140" image={imgUrl} alt="Exam" />
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography gutterBottom variant="h5" component="div">
              {examName}
            </Typography>

            {/* ✅ Only exam creator teacher can see Edit/Delete */}
            {isTeacher && isCreator && (
              <Stack direction="row" spacing={1}>
                <IconButton aria-label="edit" onClick={handleEditClick}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete">
                  <DeleteIcon examId={idForEdit} />
                </IconButton>
              </Stack>
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            MCQ
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1}>
            <Typography variant="h6">{totalQuestions} ques</Typography>
            <Typography color="textSecondary">{duration}</Typography>
          </Stack>
          {!isTeacher && (
            <Typography variant="caption" color={isUpcoming ? 'warning.main' : isExpired ? 'error.main' : 'success.main'}>
              {isUpcoming ? 'Upcoming' : isExpired ? 'Expired' : 'Active'}
            </Typography>
          )}
        </CardContent>
      </Box>
    </Card>
  );
}
