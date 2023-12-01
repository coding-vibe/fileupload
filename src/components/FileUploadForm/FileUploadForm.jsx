/* eslint-disable react/prop-types */
import { useCallback, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, Field } from 'formik';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import VALIDATION_SCHEMA from './validation';
import * as classes from './styles';

const FileUploadForm = () => {
  const handleSubmit = (
    values,
    { setSubmitting }
  ) => {
    setSubmitting(false);
    console.log(values);
  };

  return (
    <Formik
      initialValues={{ file: '' }}
      onSubmit={handleSubmit}
      validationSchema={VALIDATION_SCHEMA}
    >
      {() => (
        <Form>
          <Field
            component={ImageField}
            css={classes.wrap}
            name='file'
          />
          <Button
            sx={{ bgcolor: 'secondary.dark' }}
            type='submit'
            variant='contained'>
            Send image
          </Button>
        </Form>
      )}
    </Formik>
  );
}

const ImageField = ({
  className,
  field: { name, value },
  form: { getFieldMeta, setFieldValue },
}) => {

  const meta = getFieldMeta(name);
  const error = meta.touched && !!meta.error ? meta.error : '';

  if (value)
    return (
      <div>
        <img alt={name} css={classes.img} src={`http://localhost:8000${value}`} />
        <div css={classes.box}>
          <span>{value}</span>
          <DeleteIcon />
        </div>
      </div>
    )

  return (
    <Box>
      <FileUploader className={className} name={name} onUploadSuccess={(url) => setFieldValue(name, url)} />
      {error &&
        <FormHelperText error css={classes.helperText}>
          {error}
        </FormHelperText>}
    </Box>
  );
}

const ALLOWED_FILE_EXTENSIONS = ['.gif', '.jpeg', '.jpg', '.png'];
const RANDOM_IMAGE_DESCRIPTION = 'Lorem ipsum dolor sit amet';
const MAX_FILE_SIZE = 7000000;
const MIN_IMAGE_DIMENSIONS = {
  height: 500,
  width: 500,
};
const SCALE_CONFIG = {
  min: 1,
  max: 2,
};
const URL = 'http://localhost:8000/file-upload/';

const convertBase64ToImage = (base64) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = base64;
  });
};


const getBlob = async (canvas) => {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
          resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

const FileUploader = ({
  className,
  name,
  onUploadSuccess,
}) => {
  const editorRef = useRef(null);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(SCALE_CONFIG.max);

const handleClick = async () => {
  try {
    const canvas = editorRef.current.getImageScaledToCanvas();
    const blob = await getBlob(canvas);
    const croppedImage = new File([blob], image.name, {
      type: image.type,
    });

    const formData = new FormData();
    formData.append('title', image.name);
    formData.append('image', croppedImage);
    formData.append('description', RANDOM_IMAGE_DESCRIPTION);

    const requestOptions = {
      method: 'POST',
      body: formData,
    };

    const response = await fetch(URL, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    onUploadSuccess(responseData.image_url);
  } catch (error) {
    console.error('Error during file upload:', error);
  }
};

  const handleZoomChange = (_, newZoom) => {
    setZoom(newZoom);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      setError('');
      const [file] = acceptedFiles;
      const base64 = await readFileAsDataURL(file);
      const img = await convertBase64ToImage(base64);

      if (img.width >= MIN_IMAGE_DIMENSIONS.width && img.height >= MIN_IMAGE_DIMENSIONS.height) {
        setImage({ base64, name: file.name, type: file.type });
      }
      else {
        setError(`Sorry, the minimum required image dimensions are ${MIN_IMAGE_DIMENSIONS.width}x${MIN_IMAGE_DIMENSIONS.height}`)
      }
    } catch (error) {
      console.error('Image dimensions error:', error);
    }
  }, []);

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ALLOWED_FILE_EXTENSIONS,
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <div>
      {!image && <Box {...getRootProps()} className={className}>
        <input {...getInputProps()} id={name} name={name} />
        <Typography component='div' variant='overline'>
          Drag and drop an image here, or click to select it
        </Typography>
      </Box>}
      {error &&
        <FormHelperText error css={classes.helperText}>
        {error}
      </FormHelperText>}
      {image && <div>
        <AvatarEditor
          border={50}
          height={200}
          image={image.base64}
          ref={editorRef}
          scale={zoom}
          width={200}
        />
         <Slider
          aria-labelledby='zoom-slider'
          onChange={handleZoomChange}
          max={SCALE_CONFIG.max}
          min={SCALE_CONFIG.min}
          step={0.1}
          sx={{ color: 'secondary.light' }}
          value={zoom}
        />
        <Button
          css={classes.button}
          onClick={handleClick}
          sx={{ color: 'secondary.dark'}}
        >
          Save
        </Button>
      </div>}
    </div>
  );
}

export default FileUploadForm;