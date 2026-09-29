self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{});
self.addEventListener('push',e=>{
 let data={title:'Family Points',body:'You have a new update'};
 try{if(e.data)data=e.data.json()}catch(err){}
 e.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'icon-192.png',badge:'icon-192.png',tag:'fp-push',vibrate:[200,100,200]}));
});
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
  for(const c of list){if('focus' in c)return c.focus()}
  if(clients.openWindow)return clients.openWindow('./index.html')
 }));
});
