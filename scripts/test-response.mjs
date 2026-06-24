async function run() {
  const res = await fetch('http://localhost:3000/nonexistent-route', {
    method: 'GET',
    redirect: 'manual'
  });
  console.log('Status:', res.status);
  console.log('Headers:', [...res.headers.entries()]);
}
run();
