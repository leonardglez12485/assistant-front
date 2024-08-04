import { useEffect, useState } from 'react';
import { GptMessage, MyMessage, TypingLoader, TextMessageBox } from '../../components';
import { createThreadUseCase, postQuestionUseCase } from '../../../core/use-cases';

interface Message {
  text: string;
  isGpt: boolean;
}




export const AssistantPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string>();

  // Obtener el thread, y si no existe, crearlo
  useEffect(() => {
    const threadId = localStorage.getItem('threadId');
    if ( threadId ) {
      setThreadId( threadId );
    } else {
      setIsLoading(true);
      createThreadUseCase()
        .then( (id) => {
          console.log('New Thread ID created:', id); 
          setThreadId(id);
          localStorage.setItem('threadId', id)
        })
    }
  }, []);


  // useEffect(() => {
  //   if ( threadId ) {
  //     setMessages( (prev) => [ ...prev, { text: `Número de thread ${ threadId }`, isGpt: true }] )
  //   }
  // }, [threadId])
  
  




  const handlePost = async( text: string ) => {

    if ( !threadId ) return;

    setIsLoading(true);
    setMessages( (prev) => [...prev, { text: text, isGpt: false }] );

    
  try {
    const replies = await postQuestionUseCase(threadId, text);
    setIsLoading(false);

    const newMessages = replies.flatMap((reply) =>
      reply.content.map((message) => ({
        text: message,
        isGpt: reply.role === 'assistant',
        info: reply,
      }))
    );

    setMessages((prev) => {
      // Filtrar mensajes duplicados
      const uniqueMessages = newMessages.filter(
        (newMsg) => !prev.some((prevMsg) => prevMsg.text === newMsg.text)
      );
      return [...prev, ...uniqueMessages];
    });
  } catch (error) {
    setIsLoading(false);
    console.error("Error posting question:", error);
  }

    // const replies = await postQuestionUseCase(threadId, text)
    
    // setIsLoading(false);

    // for (const reply of replies) {
    //   for (const message of reply.content) {
    //     setMessages ( (prev) => [
    //       ...prev,
    //       { text: message, isGpt: (reply.role === 'assistant'), info: reply  }
    //     ] )
    //   }
    // }
    


  }
  const clearThread = () => {
    setMessages([]);
    createThreadUseCase()
        .then( (id) => {
          console.log('New Thread ID created:', id); 
          setThreadId(id);
          localStorage.setItem('threadId', id)
        })
  };


  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessage text="Hello, I'm Max, an assistent created by Leo. What can I do for you..!!!" />

          {
            messages.map( (message, index) => (
              message.isGpt
                ? (
                  <GptMessage key={ index } text={ message.text } />
                )
                : (
                  <MyMessage key={ index } text={ message.text } />
                )
                
            ))
          }

          {
            isLoading && (
              <div className="col-start-1 col-end-12 fade-in">
                <TypingLoader />
              </div>
            )
          }
          

        </div>
      </div>

      <button onClick={clearThread} className="clear-thread-button">
      <i className="fas fa-broom"></i>
      </button>
      <TextMessageBox 
        onSendMessage={ handlePost }
        placeholder='Escribe aquí lo que deseas'
        disableCorrections
      />

    </div>
  );
};
