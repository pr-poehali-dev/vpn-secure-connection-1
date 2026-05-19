import json
import os
import base64
import boto3
from botocore.exceptions import ClientError


def handler(event: dict, context) -> dict:
    """Облачное хранилище: загрузка, список и удаление файлов через S3."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    bucket = 'files'
    prefix = 'storage/'
    access_key = os.environ['AWS_ACCESS_KEY_ID']
    cdn_base = f"https://cdn.poehali.dev/projects/{access_key}/bucket"

    method = event.get('httpMethod', 'GET')
    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    # GET — список файлов
    if method == 'GET':
        response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
        files = []
        for obj in response.get('Contents', []):
            key = obj['Key']
            name = key.replace(prefix, '', 1)
            if not name:
                continue
            files.append({
                'key': key,
                'name': name,
                'size': obj['Size'],
                'last_modified': obj['LastModified'].isoformat(),
                'url': f"{cdn_base}/{key}",
            })
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'files': files}),
        }

    # POST — загрузка файла
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        filename = body.get('filename', 'file')
        content_type = body.get('content_type', 'application/octet-stream')
        data_b64 = body.get('data', '')
        file_data = base64.b64decode(data_b64)
        key = f"{prefix}{filename}"
        s3.put_object(Bucket=bucket, Key=key, Body=file_data, ContentType=content_type)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'key': key,
                'name': filename,
                'url': f"{cdn_base}/{key}",
            }),
        }

    # DELETE — удаление файла
    if method == 'DELETE':
        body = json.loads(event.get('body') or '{}')
        key = body.get('key', '')
        if not key.startswith(prefix):
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid key'})}
        s3.delete_object(Bucket=bucket, Key=key)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True}),
        }

    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'}),
    }