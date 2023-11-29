/* eslint-disable react/prop-types */
import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import AvatarEditor from 'react-avatar-editor';
import { Formik, Form, Field } from 'formik';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import VALIDATION_SCHEMA from './validation';
import * as classes from './styles';

const FileUploadForm = () => {
  const handleSubmit = (
    values,
  ) => {
    console.log(values);
  }

  return (
    <Formik
      initialValues={{ file: null }}
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
        <Box sx={{ color: 'error.dark', mb: 2 }}>
          {error}
        </Box>}
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
const URL = 'http://localhost:8000/file-upload/';

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
}

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
}


const FileUploader = ({
  className,
  name,
  onUploadSuccess,
}) => {
  const [image, setImage] = useState(null);
  const editorRef = useRef(null);

  const handleClick = () => {
    const croppedImageUrl = editorRef.current.getImage().toDataURL();
    const croppedImage = new Image();
    croppedImage.src = croppedImageUrl;
    console.log(croppedImage);

    const formData = new FormData();
    formData.append('title', RANDOM_IMAGE_DESCRIPTION);
    formData.append('image', croppedImage);
    formData.append('description', RANDOM_IMAGE_DESCRIPTION);

    const requestOptions = {
      method: 'POST',
      body: formData,
    };

    fetch(URL, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((response) => {
        onUploadSuccess(response.image_url);
      })
      .catch(error => {
        console.error('Error during file upload:', error);
      });
  };

  const onDrop = useCallback(acceptedFiles => {
    const [file] = acceptedFiles;

    readFileAsDataURL(file)
      .then((base64) => {
        convertBase64ToImage(base64)
          .then((img) => {
            if (img.width >= MIN_IMAGE_DIMENSIONS.width && img.height >= MIN_IMAGE_DIMENSIONS.height) {
              setImage(base64)
            }
          })
      })
      .catch((error) => {
        console.error('Image dimensions error:', error);
      });

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
      {image && <div>
        <AvatarEditor
          ref={editorRef}
          image={image}
          width={200}
          height={200}
          border={50}
          scale={1.2}
        />
        <Button
          onClick={handleClick}
          sx={{ color: 'secondary.dark', display: 'block', m: '0px auto 15px' }}
        >
          Save
        </Button>
      </div>}
    </div>
  );
}

export default FileUploadForm;