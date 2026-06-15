export async function uploadImage(file: File) 
{
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "Chat App");
  const response = await fetch("https://api.cloudinary.com/v1_1/dkc0ds0c5/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await response.json();
  return data.secure_url;
}