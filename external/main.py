import json
import os

# 逐行读取orders.json，将每行转换为dict
orders = []
with open('orders.json', 'r', encoding='utf-8') as f:
    for line in f:
        orders.append(json.loads(line))

# orders = [order for order in orders if order.get('type') == '个人账号购买']
orders = [order for order in orders]

# 逐行读取users.json，将每行转换为dict
users = []
with open('users.json', 'r', encoding='utf-8') as f:
    for line in f:
        users.append(json.loads(line))


for order in orders:
    mid = order.get('mid')
    openid = order.get('openid')
    # 给openid对应的用户增加mid
    for user in users:
        if user.get('_openid') == openid:
            if 'm_clearance' not in user:
                user['m_clearance'] = []
            user['m_clearance'].append(mid)
            break


for u in users:
    if 'g_clearance' not in u:
        u['g_clearance'] = []
    if 'm_clearance' not in u:
        u['m_clearance'] = []
    if 'k_clearance' not in u:
        u['k_clearance'] = []

# 将users写入users_new.json
with open('users_new.json', 'w', encoding='utf-8') as f:
    for user in users:
        f.write(json.dumps(user) + '\n')
