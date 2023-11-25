import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function FileUploader() {
  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles);
  }, []);

  const {
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div>Drag and drop your images here.</div>
    </div>
  )
}

export default FileUploader;