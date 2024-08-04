
export const createThreadUseCase = async () => {
  
  try {
    
    const resp = await fetch(`${ import.meta.env.VITE_ASSISTANT_API }create-threads`,{
      method: 'POST'
    });

    const { id } = await resp.json() as { id: string };
    console.log(id)

    return id;

  } catch (error) {

    throw new Error('Error creating thread');
  }


}


