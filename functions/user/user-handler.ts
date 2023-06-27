exports.handler = async function (event: any) {
    console.log('request:', JSON.stringify(event, undefined, 2));
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ Message: 'Hello User!!' })
    };
  };
  