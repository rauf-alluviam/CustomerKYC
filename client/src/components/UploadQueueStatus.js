import React from 'react';
import { 
  Paper, 
  Typography, 
  LinearProgress, 
  Box, 
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  CloudUpload, 
  Queue as QueueIcon, 
  CheckCircle, 
  Error,
  ExpandMore,
  ExpandLess,
  ClearAll
} from '@mui/icons-material';
import { useFileUploadQueue } from '../contexts/FileUploadQueueContext';

const UploadQueueStatus = ({ 
  show = true, 
  compact = false,
  onClearCompleted 
}) => {
  const { 
    uploadQueue, 
    isProcessing, 
    getQueueStats,
    clearProcessedItems 
  } = useFileUploadQueue();
  
  const [expanded, setExpanded] = React.useState(false);
  const stats = getQueueStats();

  if (!show || stats.total === 0) {
    return null;
  }

  const progress = stats.total > 0 ? ((stats.completed + stats.failed) / stats.total) * 100 : 0;

  if (compact) {
    return (
      <Chip
        icon={<CloudUpload />}
        label={`${stats.completed}/${stats.total} uploaded`}
        color={isProcessing ? 'primary' : stats.failed > 0 ? 'error' : 'success'}
        variant={isProcessing ? 'filled' : 'outlined'}
        size="small"
      />
    );
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: '#f8f9fa',
        border: '1px solid #e9ecef'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload color="primary" />
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
            Upload Queue Status
          </Typography>
          {isProcessing && (
            <Chip
              label="Processing..."
              color="primary"
              size="small"
              icon={<CloudUpload />}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {stats.completed > 0 && (
            <IconButton
              size="small"
              onClick={() => {
                clearProcessedItems();
                if (onClearCompleted) onClearCompleted();
              }}
              title="Clear completed items"
            >
              <ClearAll />
            </IconButton>
          )}
          
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ 
              flex: 1, 
              height: 8, 
              borderRadius: 4,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: stats.failed > 0 ? '#f44336' : '#4caf50'
              }
            }}
          />
          <Typography variant="body2" sx={{ minWidth: 50 }}>
            {Math.round(progress)}%
          </Typography>
        </Box>

        {/* Stats Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {stats.queued > 0 && (
            <Chip
              icon={<QueueIcon />}
              label={`${stats.queued} queued`}
              size="small"
              variant="outlined"
            />
          )}
          {stats.uploading > 0 && (
            <Chip
              icon={<CloudUpload />}
              label={`${stats.uploading} uploading`}
              size="small"
              color="primary"
            />
          )}
          {stats.completed > 0 && (
            <Chip
              icon={<CheckCircle />}
              label={`${stats.completed} completed`}
              size="small"
              color="success"
            />
          )}
          {stats.failed > 0 && (
            <Chip
              icon={<Error />}
              label={`${stats.failed} failed`}
              size="small"
              color="error"
            />
          )}
        </Box>
      </Box>

      {/* Detailed File List */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Files in Queue:
          </Typography>
          {uploadQueue.map(item => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 0.5,
                px: 1,
                mb: 0.5,
                bgcolor: 'white',
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                {item.status === 'queued' && <QueueIcon fontSize="small" color="disabled" />}
                {item.status === 'uploading' && <CloudUpload fontSize="small" color="primary" />}
                {item.status === 'completed' && <CheckCircle fontSize="small" color="success" />}
                {item.status === 'failed' && <Error fontSize="small" color="error" />}
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.file.name}
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {item.fieldName}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* Helper Text */}
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 1, 
          display: 'block', 
          color: '#666',
          fontStyle: 'italic'
        }}
      >
        💡 Files are queued for upload. They will be uploaded to S3 after form submission with the correct customer name.
      </Typography>
    </Paper>
  );
};

export default UploadQueueStatus;
