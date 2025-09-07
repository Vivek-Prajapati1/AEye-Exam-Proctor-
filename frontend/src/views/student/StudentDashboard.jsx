import React, { useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Divider,
  Chip,
  Avatar,
  Stack,
  Paper,
  IconButton,
  LinearProgress,
  CardMedia,
  Fade,
  Zoom,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetExamsQuery, useGetStudentStatsQuery } from "src/slices/examApiSlice";
import { 
  Assignment as AssignmentIcon, 
  TrendingUp as TrendingUpIcon, 
  EmojiEvents as EmojiEventsIcon, 
  Grade as GradeIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Quiz as QuizIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Fetch exams and student stats
  const { data: userExams = [], isLoading } = useGetExamsQuery();
  const { data: studentStats, isLoading: statsLoading } = useGetStudentStatsQuery();

  // Handle the data structure - could be array or object with exams property
  const examsArray = Array.isArray(userExams) 
    ? userExams 
    : (userExams && Array.isArray(userExams.exams))
      ? userExams.exams
      : [];

  // Filter upcoming exams (exams that haven't ended yet but may not be live yet)
  const now = new Date();
  const upcomingExams = examsArray.filter(exam => {
    const deadDate = new Date(exam.deadDate);
    return deadDate > now;
  }).slice(0, 4);

  // Filter live exams (exams that are currently available to take)
  const liveExams = examsArray.filter(exam => {
    const now = new Date();
    const liveDate = new Date(exam.liveDate);
    const deadDate = new Date(exam.deadDate);
    return now >= liveDate && now <= deadDate;
  });

  // Filter recently completed exams
  const completedExams = examsArray.filter(exam => {
    const deadDate = new Date(exam.deadDate);
    return deadDate <= now;
  }).slice(0, 3);

  // Check if exam is currently live (between liveDate and deadDate)
  const isExamLive = (exam) => {
    const now = new Date();
    const liveDate = new Date(exam.liveDate);
    const deadDate = new Date(exam.deadDate);
    return now >= liveDate && now <= deadDate;
  };

  // Check if exam hasn't started yet
  const isExamPending = (exam) => {
    const now = new Date();
    const liveDate = new Date(exam.liveDate);
    return now < liveDate;
  };

  // Get exam status
  const getExamStatus = (exam) => {
    if (isExamLive(exam)) return 'live';
    if (isExamPending(exam)) return 'pending';
    return 'expired';
  };

  const recentResults = studentStats?.recentSubmissions || [];
  const { completedExams: completedCount = 0, avgScore = 0, totalScore = 0 } = studentStats || {};

  // Helper function to get score color
  const getScoreColor = (score, totalQuestions) => {
    const percentage = (score / (totalQuestions * 10)) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  // Helper function to format time remaining until deadline
  const getTimeRemaining = (deadDate) => {
    const now = new Date();
    const deadline = new Date(deadDate);
    const timeDiff = deadline - now;
    
    if (timeDiff <= 0) return 'Expired';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Less than 1 hour';
  };

  // Helper function to format time until exam starts
  const getTimeUntilStart = (liveDate) => {
    const now = new Date();
    const startTime = new Date(liveDate);
    const timeDiff = startTime - now;
    
    if (timeDiff <= 0) return null;
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `Starts in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Starts in ${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Starts in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'Starting soon';
  };

  // Get exam urgency color based on status
  const getUrgencyColor = (exam) => {
    const status = getExamStatus(exam);
    if (status === 'expired') return 'error';
    if (status === 'pending') return 'info';
    
    // For live exams, check urgency based on time remaining
    const now = new Date();
    const deadline = new Date(exam.deadDate);
    const timeDiff = deadline - now;
    const hoursLeft = timeDiff / (1000 * 60 * 60);
    
    if (hoursLeft <= 24) return 'error';
    if (hoursLeft <= 72) return 'warning';
    return 'success';
  };

  // Handle exam start button click
  const handleExamStart = (exam) => {
    const examId = exam.examId || exam._id;
    const status = getExamStatus(exam);
    
    if (status === 'live') {
      navigate(`/exam/${examId}`);
    } else if (status === 'pending') {
      // Show snackbar that exam hasn't started yet
      const startDate = new Date(exam.liveDate);
      setSnackbar({
        open: true,
        message: `This exam will be available from ${startDate.toLocaleString()}`,
        severity: 'warning'
      });
    } else {
      // Exam has expired
      setSnackbar({
        open: true,
        message: 'This exam has already expired and is no longer available.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title="Student Dashboard" description="Your exam dashboard overview">
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        p: 3
      }}>
        {/* Hero Section */}
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={8}
            sx={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              borderRadius: 4,
              p: 4,
              mb: 4,
              border: '1px solid rgba(102, 126, 234, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                borderRadius: '50%',
                transform: 'translate(50px, -50px)'
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  <PersonIcon sx={{ fontSize: '2.5rem' }} />
                </Avatar>
                <Box flex={1}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 'bold', 
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    Welcome back, {userInfo?.name || "Student"}! 🎓
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Ready to excel in your next exam? Track your progress and achieve your goals!
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      icon={<StarIcon />} 
                      label={`${completedCount} Exams Completed`} 
                      color="primary" 
                      variant="filled"
                    />
                    <Chip 
                      icon={<TrendingUpIcon />} 
                      label={`${avgScore}% Average Score`} 
                      color="success" 
                      variant="filled"
                    />
                  </Box>
                </Box>
                {liveExams.length > 0 && (
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {liveExams.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Live Exams
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<NotificationsIcon />}
                      sx={{ 
                        mt: 1,
                        background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #ee5a24, #ff6b6b)',
                        }
                      }}
                      size="small"
                    >
                      Take Now
                    </Button>
                  </Box>
                )}
              </Stack>
            </Box>
          </Paper>
        </Fade>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              icon: <AssignmentIcon sx={{ fontSize: 40 }} />, 
              value: completedCount, 
              label: "Completed Exams", 
              color: "#667eea",
              bgGradient: 'linear-gradient(135deg, #667eea 0%, #5a67d8 100%)'
            },
            { 
              icon: <TrendingUpIcon sx={{ fontSize: 40 }} />, 
              value: `${avgScore}%`, 
              label: "Average Score", 
              color: "#48bb78",
              bgGradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
            },
            { 
              icon: <GradeIcon sx={{ fontSize: 40 }} />, 
              value: totalScore, 
              label: "Total Points", 
              color: "#ed8936",
              bgGradient: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)'
            },
            { 
              icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />, 
              value: liveExams.length, 
              label: "Live Exams", 
              color: "#f56565",
              bgGradient: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)'
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Zoom in={true} timeout={1000 + index * 200}>
                <Card 
                  sx={{ 
                    background: stat.bgGradient,
                    color: 'white',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${stat.color}40`
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)'
                    }
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ opacity: 0.9 }}>
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Upcoming Exams */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={4}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              }}
            >
              <Box sx={{ 
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                p: 3 
              }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <ScheduleIcon sx={{ fontSize: 28 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Upcoming Exams
                  </Typography>
                  <Chip 
                    label={`${liveExams.length} Live, ${upcomingExams.length - liveExams.length} Pending`} 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                    size="small"
                  />
                </Stack>
              </Box>
              
              <Box sx={{ p: 3 }}>
                {upcomingExams.length > 0 ? (
                  <Stack spacing={3}>
                    {upcomingExams.map((exam, index) => {
                      const examId = exam.examId || exam._id;
                      const urgencyColor = getUrgencyColor(exam);
                      const examStatus = getExamStatus(exam);
                      const isLive = examStatus === 'live';
                      const isPending = examStatus === 'pending';
                      
                      return (
                        <Zoom key={examId} in={true} timeout={1200 + index * 200}>
                          <Card
                            sx={{
                              borderLeft: `5px solid`,
                              borderLeftColor: `${urgencyColor}.main`,
                              borderRadius: 2,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              opacity: isPending ? 0.8 : 1,
                              '&:hover': {
                                transform: 'translateX(8px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                borderLeftWidth: '8px'
                              }
                            }}
                          >
                            <CardContent>
                              <Stack direction="row" spacing={3} alignItems="center">
                                <Box
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: isPending 
                                      ? 'linear-gradient(45deg, #a0aec0, #718096)'
                                      : urgencyColor === 'error' 
                                        ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)'
                                        : urgencyColor === 'warning'
                                          ? 'linear-gradient(45deg, #feca57, #ff9ff3)'
                                          : 'linear-gradient(45deg, #48bb78, #38a169)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                  }}
                                >
                                  <QuizIcon sx={{ fontSize: 28 }} />
                                </Box>
                                
                                <Box flex={1}>
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                      {exam.examName}
                                    </Typography>
                                    {isPending && (
                                      <Chip 
                                        size="small" 
                                        label="Not Started" 
                                        color="info" 
                                        variant="outlined"
                                      />
                                    )}
                                    {isLive && (
                                      <Chip 
                                        size="small" 
                                        label="Live Now" 
                                        color="success" 
                                        sx={{ 
                                          animation: 'pulse 2s infinite',
                                          '@keyframes pulse': {
                                            '0%': { opacity: 1 },
                                            '50%': { opacity: 0.7 },
                                            '100%': { opacity: 1 }
                                          }
                                        }}
                                      />
                                    )}
                                  </Stack>
                                  
                                  <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <TimerIcon color="action" fontSize="small" />
                                      <Typography variant="body2" color="text.secondary">
                                        {exam.duration} min
                                      </Typography>
                                    </Stack>
                                    
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <AssignmentIcon color="action" fontSize="small" />
                                      <Typography variant="body2" color="text.secondary">
                                        {exam.totalQuestions} questions
                                      </Typography>
                                    </Stack>
                                    
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <AccessTimeIcon color={urgencyColor} fontSize="small" />
                                      <Typography variant="body2" color={`${urgencyColor}.main`} fontWeight="medium">
                                        {isPending ? getTimeUntilStart(exam.liveDate) : getTimeRemaining(exam.deadDate)}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                  
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    <strong>Start:</strong> {new Date(exam.liveDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Due:</strong> {new Date(exam.deadDate).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                </Box>
                                
                                <Button
                                  variant="contained"
                                  startIcon={<PlayArrowIcon />}
                                  onClick={() => handleExamStart(exam)}
                                  disabled={isPending}
                                  sx={{
                                    background: isPending 
                                      ? 'linear-gradient(45deg, #a0aec0, #718096)'
                                      : 'linear-gradient(45deg, #667eea, #764ba2)',
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    '&:hover': {
                                      background: isPending 
                                        ? 'linear-gradient(45deg, #a0aec0, #718096)'
                                        : 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                                      transform: isPending ? 'none' : 'scale(1.05)'
                                    },
                                    '&:disabled': {
                                      color: 'white',
                                      opacity: 0.7
                                    }
                                  }}
                                >
                                  {isPending ? 'Not Available' : 'Start Exam'}
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Zoom>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={6}>
                    <AssignmentIcon 
                      sx={{ 
                        fontSize: 80, 
                        color: 'text.disabled', 
                        mb: 2,
                        opacity: 0.5
                      }} 
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No upcoming exams
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All caught up! Check back later for new exams.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Recent Results & Quick Actions */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Recent Results */}
              <Paper
                elevation={4}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                }}
              >
                <Box sx={{ 
                  background: 'linear-gradient(90deg, #48bb78 0%, #38a169 100%)', 
                  color: 'white', 
                  p: 2.5 
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <GradeIcon sx={{ fontSize: 24 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Recent Results
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ p: 2.5 }}>
                  {recentResults.length > 0 ? (
                    <Stack spacing={2}>
                      {recentResults.slice(0, 3).map((result, index) => {
                        const percentage = Math.round((result.score / (result.totalQuestions * 10)) * 100);
                        const scoreColor = getScoreColor(result.score, result.totalQuestions);
                        return (
                          <Fade key={result._id} in={true} timeout={1500 + index * 300}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${scoreColor === 'success' ? '#f0fff4' : scoreColor === 'warning' ? '#fffaf0' : '#fff5f5'} 0%, #ffffff 100%)`,
                                border: `2px solid ${scoreColor === 'success' ? '#c6f6d5' : scoreColor === 'warning' ? '#fed7aa' : '#fed7d7'}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {result.examName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(result.submittedAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Box textAlign="right">
                                  <Typography variant="h6" color={`${scoreColor}.main`} fontWeight="bold">
                                    {result.score}
                                  </Typography>
                                  <Typography variant="caption" color={`${scoreColor}.main`}>
                                    {percentage}%
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Fade>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <GradeIcon sx={{ fontSize: 50, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        No results yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Quick Actions */}
              <Paper
                elevation={4}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                }}
              >
                <Box sx={{ 
                  background: 'linear-gradient(90deg, #ed8936 0%, #dd6b20 100%)', 
                  color: 'white', 
                  p: 2.5 
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PlayArrowIcon sx={{ fontSize: 24 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Quick Actions
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate("/exam")}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      Browse All Exams
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<GradeIcon />}
                      onClick={() => navigate("/result")}
                      sx={{
                        borderColor: '#48bb78',
                        color: '#48bb78',
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#48bb78',
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(72, 187, 120, 0.4)'
                        }
                      }}
                    >
                      View All Results
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PersonIcon />}
                      onClick={() => navigate("/user/profile")}
                      sx={{
                        borderColor: '#ed8936',
                        color: '#ed8936',
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#ed8936',
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(237, 137, 54, 0.4)'
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
};

export default StudentDashboard;
